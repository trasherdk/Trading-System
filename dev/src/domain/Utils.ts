

export type Id = string

export const UUIDGenerator = (): Id => {
    const head = Date.now().toString();
    const tail = Math.random().toString().substring(2);

    return head + tail
}
