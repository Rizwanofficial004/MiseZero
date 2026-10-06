declare module "papaparse" {
  export interface ParseError {
    message: string;
    row?: number;
  }
  export interface ParseResult<T> {
    data: T[];
    errors: ParseError[];
  }
  export function parse<T>(
    input: string,
    config?: { header?: boolean; skipEmptyLines?: boolean | "greedy" },
  ): ParseResult<T>;
}
