import path from 'path';
import visit from 'unist-util-visit';
import { Node } from 'unist';
import { Page } from './types';
import toString from 'mdast-util-to-string';
import Slugger from 'github-slugger';
import YAML from 'yaml';
import url from 'url';

const slug = Slugger.slug;

export function generateUrl(
  source: string,
  meta: Page['metadata'],
  prefix?: string,
  suffix?: string
): string {
  const parts: string[] = [''];
  if (prefix) {
    parts.push(prefix);
  }
  if (meta.package) {
    parts.push(slug(meta.package));
  }
  if (meta.category) {
    parts.push(slug(meta.category));
  }
  let file = path.parse(path.basename(source));
  if (file.name === 'index') {
    file = path.parse(path.basename(path.dirname(source)));
  }
  parts.push(`${file.name}${suffix || ''}`);
  return parts.join('/');
}

export function inferTitle(ast: Node): string | undefined {
  let docTitle: string | undefined;
  visit(ast, 'heading', (node) => {
    const { depth } = node;
    if (depth !== 1) return;
    docTitle = toString(node);
  });
  return docTitle;
}

export function parseFrontmatter(source: string, ast: Node): object {
  let result = {};
  visit(ast, 'yaml', (node) => {
    try {
      result = YAML.parse(node.value as string);
    } catch (e) {
      console.error(`Error while parsing frontmatter in ${source}: `, e);
    }
  });

  return result;
}

export function isValidUrl(s: string): boolean {
  try {
    new url.URL(s);
    return true;
  } catch {
    return false;
  }
}

export function isAnchorUrl(s: string): boolean {
  return s[0] === '#';
}