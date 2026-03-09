import en from "@/dictionaries/en.json";

type WidenLiterals<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends (infer U)[]
        ? WidenLiterals<U>[]
        : T extends object
          ? { [K in keyof T]: WidenLiterals<T[K]> }
          : T;

export type Dictionary = WidenLiterals<typeof en>;