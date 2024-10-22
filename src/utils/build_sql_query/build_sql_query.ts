import { compile, tql } from 'jsr:@arekx/teeql';

export function build_sql_query(strings: TemplateStringsArray, ...expressions: any[]) {
    return compile(tql(strings, ...expressions));
}

export const bsq = build_sql_query;
