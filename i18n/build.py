#!/usr/bin/env python3
"""Static translations of www.qp1ng.com pages: one folder per language, no third-party script, the same CSS and JS.

    python i18n/build.py extract   # i18n/<page>/source.json: every text to translate, in page order
    python i18n/build.py build     # writes docs/<page path>/<lang>/index.html and refreshes the language links

Translations live in i18n/<page>/<lang>.json as {"segments": {english: translation}, "messages": {...}}.
A segment is the inner HTML of the smallest element that holds a whole sentence: inline tags stay inside it and
must come back unchanged (they may move); icons and images are placeholders {{1}}, {{2}}. A translation that loses
or alters a tag is not used: the English text stays and the build says so. "messages" are the texts the page's
script writes (t("...") calls), handed over in a JSON block (not executed, so the page's CSP is unaffected).
Cloudflare's site worker sends visitors to their language (tools/site-worker in the Q-P1NG repository).
"""
import html
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
SITE = "https://www.qp1ng.com"

# The app's languages, plus Traditional Chinese (Taiwan, Hong Kong): the website speaks to the same people as the app.
LANGS = {
    "en": "English", "it": "Italiano", "de": "Deutsch", "es": "Español", "fr": "Français",
    "pt-BR": "Português (Brasil)", "pl": "Polski", "ru": "Русский", "uk": "Українська", "ar": "العربية",
    "fa": "فارسی", "ja": "日本語", "zh-CN": "简体中文", "zh-TW": "繁體中文", "my": "မြန်မာ",
}
RTL = {"ar", "fa"}
# The language menu's name for screen readers, in each language.
LANGUAGE_LABEL = {
    "en": "Language", "it": "Lingua", "de": "Sprache", "es": "Idioma", "fr": "Langue", "pt-BR": "Idioma",
    "pl": "Język", "ru": "Язык", "uk": "Мова", "ar": "اللغة", "fa": "زبان", "ja": "言語", "zh-CN": "语言", "zh-TW": "語言",
    "my": "ဘာသာစကား",
}
OG_LOCALE = {
    "en": "en_US", "it": "it_IT", "de": "de_DE", "es": "es_ES", "fr": "fr_FR", "pt-BR": "pt_BR", "pl": "pl_PL",
    "ru": "ru_RU", "uk": "uk_UA", "ar": "ar_AR", "fa": "fa_IR", "ja": "ja_JP", "zh-CN": "zh_CN", "zh-TW": "zh_TW",
    "my": "my_MM",
}

# The Pro page lives under /pro/<lang>/: Cloudflare gives everything under /pro/ the checkout's security policy.
# The home lives under /<lang>/ with relative links ("../styles.css"), so it also works on the IPFS mirror, where an
# absolute "/..." would leave the site's folder. "fn" is the scripts' translation function, "messages_id" the JSON
# block that carries its texts. A page whose source has no i18n markers yet is skipped by build.
PAGES = {
    "pro": {"source": "pro/index.html", "path": "/pro/", "scripts": ["pro/pro.js"], "fn": "t",
            "messages_id": "pro-i18n", "ld_urls": True},
    "home": {"source": "index.html", "path": "/", "scripts": ["script.js", "app-feature-demos.js", "qdream-gallery.js",
             "qcast-hero-player.js", "qgeo-demo.js"], "fn": "T", "messages_id": "site-i18n", "relative": True},
}

VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}
INLINE = {"a", "abbr", "b", "bdi", "bdo", "br", "cite", "code", "data", "em", "i", "kbd", "mark", "q", "s", "samp",
          "small", "span", "strong", "sub", "sup", "time", "u", "var", "wbr", "img", "svg"}
OPAQUE = {"svg", "img"}  # placeholders inside a segment
SKIP = {"script", "style", "template", "pre", "code", "svg"}
# data-text: the copy of a glitch title drawn twice by CSS (content: attr(data-text)), the same words as the title.
ATTRS = ("alt", "title", "aria-label", "placeholder", "data-text")
META = {"description", "og:title", "og:description", "og:image:alt", "twitter:title", "twitter:description",
        "twitter:image:alt"}
MARK = "<!-- i18n:{name} -->"
END = "<!-- /i18n:{name} -->"


class Node:
    def __init__(self, tag, attrs, start, open_end, parent):
        self.tag, self.attrs, self.start, self.open_end, self.parent = tag, dict(attrs), start, open_end, parent
        self.close_start = self.end = open_end
        self.children = []


class Tree(HTMLParser):
    """Elements with their offsets in the source, so segments are cut from the original text unchanged."""

    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.text = text
        self.lines = [0]
        for match in re.finditer("\n", text):
            self.lines.append(match.end())
        self.root = Node("#root", [], 0, 0, None)
        self.root.close_start = self.root.end = len(text)
        self.stack = [self.root]
        self.feed(text)
        self.close()

    def position(self):
        line, col = self.getpos()
        return self.lines[line - 1] + col

    def handle_starttag(self, tag, attrs):
        start = self.position()
        node = Node(tag, attrs, start, start + len(self.get_starttag_text()), self.stack[-1])
        self.stack[-1].children.append(node)
        if tag not in VOID:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        start = self.position()
        node = Node(tag, attrs, start, start + len(self.get_starttag_text()), self.stack[-1])
        self.stack[-1].children.append(node)

    def handle_endtag(self, tag):
        start = self.position()
        for depth in range(len(self.stack) - 1, 0, -1):
            if self.stack[depth].tag == tag:
                end = self.text.index(">", start) + 1
                for node in self.stack[depth:]:
                    node.close_start, node.end = start, end
                del self.stack[depth:]
                return


def inline_only(node):
    return all(child.tag in INLINE and (child.tag in OPAQUE or inline_only(child)) for child in node.children)


def direct_text(text, node):
    """The node's own text, without its child elements."""
    out, cursor = [], node.open_end
    for child in node.children:
        out.append(text[cursor:child.start])
        cursor = child.end
    out.append(text[cursor:node.close_start])
    return html.unescape(re.sub(r"<!--.*?-->", "", "".join(out), flags=re.S)).strip()


def normalise(fragment):
    return re.sub(r"\s+", " ", fragment).strip()


def segment_of(text, node):
    """The node's inner HTML with icons and images as {{n}}, and the markup each placeholder stands for."""
    pieces, opaque, cursor = [], [], node.open_end

    def walk(parent):
        nonlocal cursor
        for child in parent.children:
            if child.tag in OPAQUE:
                pieces.append(text[cursor:child.start])
                opaque.append(text[child.start:child.end])
                pieces.append("{{%d}}" % len(opaque))
                cursor = child.end
            else:
                walk(child)

    walk(node)
    pieces.append(text[cursor:node.close_start])
    return normalise("".join(pieces)), opaque


def find(text):
    """[(kind, start, end, key, opaque)]: segments (inner HTML) and attribute values to translate, in page order."""
    tree = Tree(text)
    found = []

    def visit(node, in_head):
        for child in node.children:
            head = in_head or child.tag == "head"
            if child.tag == "meta":
                key = child.attrs.get("name") or child.attrs.get("property")
                if key in META and child.attrs.get("content"):
                    found.append(("attr", child, "content"))
                continue
            if child.tag == "title" and head:
                found.append(("text", child))
                continue
            if child.tag == "script" and child.attrs.get("type") == "application/ld+json":
                found.append(("ld", child))
                continue
            if child.tag in SKIP or child.attrs.get("translate") == "no":
                continue
            for name in ATTRS:
                if child.attrs.get(name):
                    found.append(("attr", child, name))
            if child.tag not in VOID and inline_only(child) and direct_text(text, child):
                found.append(("text", child))
            else:
                visit(child, head)

    visit(tree.root, False)
    items = []
    for entry in found:
        if entry[0] == "text":
            node = entry[1]
            key, opaque = segment_of(text, node)
            if translatable(key):
                items.append(("text", node.open_end, node.close_start, key, opaque))
        elif entry[0] == "attr":
            node, name = entry[1], entry[2]
            raw = text[node.start:node.open_end]
            match = re.search(r'\s%s="([^"]*)"' % re.escape(name), raw)
            if match and re.search(r"[A-Za-z]", match.group(1)):
                start = node.start + match.start(1)
                items.append(("attr", start, start + len(match.group(1)), normalise(html.unescape(match.group(1))), []))
        else:
            node = entry[1]
            block = text[node.open_end:node.close_start]
            for match in re.finditer(r'"description":\s*"((?:[^"\\]|\\.)*)"', block):
                start = node.open_end + match.start(1)
                items.append(("ld", start, start + len(match.group(1)), json.loads('"%s"' % match.group(1)), []))
    return items


def translatable(key):
    """Words to translate, not identifiers: "TOR_CIRCUIT_LOST", "[WIDGET_SNAKE]", "0x05", "V" and the like stay."""
    if "<" in key or "{{" in key:
        return True  # markup the translation may need to reorder, such as a price around an amount
    text = html.unescape(key).strip()
    if re.search(r"[a-zß-ÿ]", text) or re.search(r"\d.*[€$£]|[€$£].*\d", text):
        return True
    letters = re.sub(r"[^A-ZÀ-Þ]", "", text)
    return len(letters) > 3 and "_" not in text and not re.match(r"^\[|^0x[0-9A-F]", text)


def tags(fragment):
    return sorted(re.findall(r"</?[a-zA-Z][^>]*>", fragment)) + sorted(re.findall(r"\{\{\d+\}\}", fragment))


def js_string(body, quote):
    """The value of a JavaScript string literal's body, quoted with ' or "."""
    if quote == "'":
        body = re.sub(r"\\'", "'", body)
        body = re.sub(r'(?<!\\)"', '\\"', body)
    return json.loads('"%s"' % body)


def messages_of(page):
    keys = []
    pattern = re.compile(r"""\b%s\(\s*(["'])((?:\\.|(?!\1)[^\\])*)\1""" % re.escape(page.get("fn", "t")))
    for script in page["scripts"]:
        for match in pattern.finditer((DOCS / script).read_text(encoding="utf-8")):
            key = js_string(match.group(2), match.group(1))
            if key not in keys:
                keys.append(key)
    return keys


LINK = re.compile(r'(\s(?:src|href|poster|srcset|data-[\w-]+)=")([^"]*)(")')


def relative_links(text, prefix):
    """Relative links to files of the site, one folder down: "styles.css?v=3" -> "../styles.css?v=3".

    Only values shaped like a path count: a folder ("pro/") or a file ("styles.css"). A bare word that happens to
    name a folder, such as a language code (data-demo-lang="it") or a channel (data-track="pro"), stays as it is."""
    def fix(match):
        parts = []
        for item in match.group(2).split(","):
            stripped = item.strip()
            path = re.split(r"[?#\s]", stripped, maxsplit=1)[0]
            looks_like_path = "/" in path or re.search(r"[^.]\.[A-Za-z0-9]{1,12}$", path)
            if (path and looks_like_path and not re.match(r"^([a-z][a-z0-9+.-]*:|/|#|\.\./)", path, re.I)
                    and (DOCS / path).exists()):
                item = item.replace(stripped, prefix + stripped, 1)
            parts.append(item)
        return match.group(1) + ",".join(parts) + match.group(3)
    return LINK.sub(fix, text)


def prepared(text):
    return all(MARK.format(name=name) in text for name in ("alternates", "switcher", "messages"))


def replace_block(text, name, content):
    start, end = MARK.format(name=name), END.format(name=name)
    if start not in text:
        raise SystemExit(f"marker {start} missing")
    head, rest = text.split(start, 1)
    _, tail = rest.split(end, 1)
    return head + start + content + end + tail


def page_url(page, lang):
    return SITE + page["path"] + ("" if lang == "en" else lang + "/")


def alternates(page):
    lines = ['\n    <link rel="alternate" hreflang="%s" href="%s">' % (lang, page_url(page, lang)) for lang in LANGS]
    lines.append('\n    <link rel="alternate" hreflang="x-default" href="%s">\n    ' % page_url(page, "en"))
    return "".join(lines)


def switcher(page, current):
    # A plain disclosure: no script. ?lang= lets the site worker remember the choice.
    base = ("" if current == "en" else "../") if page.get("relative") else page["path"]
    items = "".join(
        '<li><a href="%s%s?lang=%s" hreflang="%s" lang="%s"%s><span class="lang-item-name">%s</span>'
        '<span class="lang-item-code" aria-hidden="true">%s</span></a></li>' % (
            base, "" if lang == "en" else lang + "/", lang, lang, lang,
            ' aria-current="page"' if lang == current else "", name, lang.upper())
        for lang, name in LANGS.items())
    return ('<details class="lang" translate="no"><summary aria-label="%s"><svg viewBox="0 0 24 24" fill="none" '
            'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" '
            'aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'
            '</svg><span class="lang-name">%s</span><span class="lang-code">%s</span></summary><ul>%s</ul></details>' % (
                LANGUAGE_LABEL[current], LANGS[current], LANG_CODE.get(current, current.upper()), items))


# The short label next to the globe where the bar has no room for the language's name.
LANG_CODE = {"pt-BR": "PT", "zh-CN": "简", "zh-TW": "繁"}


def extract():
    for name, page in PAGES.items():
        text = (DOCS / page["source"]).read_text(encoding="utf-8")
        seen, segments = set(), []
        for kind, _, _, key, _ in find(text):
            if key not in seen:
                seen.add(key)
                segments.append(key)
        out = ROOT / "i18n" / name / "source.json"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps({"segments": segments, "messages": messages_of(page)}, ensure_ascii=False, indent=1)
                       + "\n", encoding="utf-8", newline="\n")
        words = sum(len(re.sub(r"<[^>]+>", " ", s).split()) for s in segments)
        print(f"{name}: {len(segments)} segments ({words} words), {len(messages_of(page))} messages -> {out.relative_to(ROOT)}")


def build():
    problems = 0
    for name, page in PAGES.items():
        source_path = DOCS / page["source"]
        source = source_path.read_text(encoding="utf-8")
        if not prepared(source):
            print(f"{name}: no i18n markers in {page['source']} yet, skipped")
            continue
        source = replace_block(source, "alternates", alternates(page))
        source = replace_block(source, "switcher", switcher(page, "en"))
        source = replace_block(source, "messages", "")
        source_path.write_text(source, encoding="utf-8", newline="\n")
        items = find(source)
        message_keys = messages_of(page)
        for lang in LANGS:
            if lang == "en":
                continue
            file = ROOT / "i18n" / name / f"{lang}.json"
            if not file.exists():
                print(f"{name}/{lang}: no translation file, skipped")
                continue
            data = json.loads(file.read_text(encoding="utf-8"))
            segments, messages = data.get("segments", {}), data.get("messages", {})
            text, missing, invalid = source, 0, []
            for kind, start, end, key, opaque in sorted(items, key=lambda item: -item[1]):
                value = segments.get(key)
                if not value:
                    missing += 1
                    continue
                if kind == "text":
                    if tags(value) != tags(key):
                        invalid.append(key[:60])
                        continue
                    for index, markup in enumerate(opaque, 1):
                        value = value.replace("{{%d}}" % index, markup)
                elif kind == "attr":
                    value = html.escape(value, quote=True)
                else:
                    value = json.dumps(value, ensure_ascii=False)[1:-1]
                text = text[:start] + value + text[end:]
            used = {key: messages[key] for key in message_keys if messages.get(key)}
            missing += len(message_keys) - len(used)
            block = '<script type="application/json" id="%s">%s</script>' % (
                page["messages_id"], json.dumps(used, ensure_ascii=False).replace("</", "<\\/"))
            text = replace_block(text, "messages", block)
            text = replace_block(text, "switcher", switcher(page, lang))
            text = re.sub(r'<html lang="en"', '<html lang="%s"%s' % (lang, ' dir="rtl"' if lang in RTL else ""), text, count=1)
            url = page_url(page, lang)
            # The pages close void tags either way ("<link ...>" or "<link ... />").
            english = re.escape(page_url(page, "en"))
            text = re.sub(r'(<link rel="canonical" href=")%s(")' % english, r"\g<1>%s\g<2>" % url, text, count=1)
            text = re.sub(r'(<meta property="og:url" content=")%s(")' % english, r"\g<1>%s\g<2>" % url, text, count=1)
            text = re.sub(r'(<meta property="og:locale" content=")en_US(")', r"\g<1>%s\g<2>" % OG_LOCALE[lang], text,
                          count=1)
            if page.get("ld_urls"):
                text = text.replace('"url": "%s"' % page_url(page, "en"), '"url": "%s"' % url)
                text = text.replace('"url": "%s#buy"' % page_url(page, "en"), '"url": "%s#buy"' % url)
            if page.get("relative"):
                text = relative_links(text, "../")
            out = DOCS / page["path"].strip("/") / lang / "index.html"
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_text(text, encoding="utf-8", newline="\n")
            status = "ok" if not missing and not invalid else f"{missing} missing, {len(invalid)} with changed tags"
            print(f"{name}/{lang}: {status}")
            for key in invalid:
                print(f"    tags changed, English kept: {key}")
            problems += missing + len(invalid)
    return problems


def check(lang):
    """Checks one language's files against the source texts without writing anything: missing, extra, changed tags."""
    problems = 0
    for name, page in PAGES.items():
        file = ROOT / "i18n" / name / f"{lang}.json"
        if not file.exists():
            continue
        source = json.loads((ROOT / "i18n" / name / "source.json").read_text(encoding="utf-8"))
        data = json.loads(file.read_text(encoding="utf-8"))
        for part in ("segments", "messages"):
            given = data.get(part, {})
            for key in source[part]:
                value = given.get(key)
                if not value:
                    print(f"{name}/{lang} {part}: missing: {key[:70]}")
                    problems += 1
                elif part == "segments" and tags(value) != tags(key):
                    print(f"{name}/{lang}: tags or placeholders changed: {key[:70]}")
                    problems += 1
                elif part == "messages" and sorted(re.findall(r"\{\w+\}", value)) != sorted(re.findall(r"\{\w+\}", key)):
                    print(f"{name}/{lang}: placeholders changed: {key[:70]}")
                    problems += 1
            for key in set(given) - set(source[part]):
                print(f"{name}/{lang} {part}: not in the source (ignored): {key[:70]}")
    print(f"{lang}: {'ok' if not problems else str(problems) + ' problems'}")
    return problems


if __name__ == "__main__":
    command = sys.argv[1] if len(sys.argv) > 1 else "build"
    if command == "extract":
        extract()
    elif command == "build":
        sys.exit(1 if build() and "--strict" in sys.argv else 0)
    elif command == "check" and len(sys.argv) > 2:
        sys.exit(1 if check(sys.argv[2]) else 0)
    else:
        raise SystemExit(__doc__)
