# Memory

The interface of memory is simple, besides trivial read and write, resolve is an utility method to get the address given segment and index.

For example, when executing command such as ```push pointer 2```, we want to know the address of pointer[2], which is ```Resolve("pointer",2)```.

Dump is also an utility, which is used in unit test.

```typescript
export interface IMemory {
    Read(address: number): number;
    Write(address: number, value: number): IMemory;
    Resolve(segment: SegmentType, index: number): number;
    Dump(start: number, end: number): Array<number>;
}
```

## Represent Memory

Segment mapping and static index are related to the implementation of static. The key of segment mapping is segment, besides "local", "this", ..., we will also treat position of static variable as segment for consistency.

```typescript
export class Memory {
    m_Memory: Array<number>;
    m_SegmentMapping: Map<SegmentType, number>;
    m_StaticIndex: number;
}
```

For example, in resolve, given command ```pop static 0``` in file ```foo.vm```, after preprocess, we get ```pop foo.vm.static 0```,thus the position of this static variable would be ```foo.vm.static.0```. We then advance ```m_StaticIndex``` and prepare for next static variable.

```typescript
<Memory /> +
    function Resolve(this: Memory & IMemory, segment: SegmentType, index: number) {
        if (["pointer", "temp"].includes(segment)) {
            return this.m_SegmentMapping.get(segment) + index;
        } else if (["local", "argument", "this", "that"].includes(segment)) {
            return this.Read(this.m_SegmentMapping.get(segment)) + index;
        } else if (segment.endsWith("static")) {
            const target = `${segment}.${index}`;
            if (this.m_SegmentMapping.has(target)) {
                return this.m_SegmentMapping.get(target);
            } else {
                const resolved = this.m_StaticIndex;
                this.m_StaticIndex += 1;
                this.m_SegmentMapping.set(target, resolved);
                return resolved;
            }
        }
    };
```

# Appendix

## Trivial

```typescript
<Memory /> +
    function constructor(this: Memory, size: number) {
        this.m_Memory = Array(size).fill(0);
        this.m_SegmentMapping = new Map<string, number>([
            ["local", MemoryAddress.Local],
            ["argument", MemoryAddress.Argument],
            ["this", MemoryAddress.This],
            ["that", MemoryAddress.That],
            ["temp", MemoryAddress.Temp],
            ["pointer", MemoryAddress.This],
            ["static", MemoryAddress.Static]
        ]);
        this.m_StaticIndex = MemoryAddress.Static;
    };
```

```typescript
<Memory /> +
    function Read(this: Memory, address: number) {
        return this.m_Memory[address];
    };
```

```typescript
<Memory /> +
    function Write(this: Memory, address: number, value: number) {
        this.m_Memory[address] = value;
        return this;
    };
```

```typescript
<Memory /> +
    function Dump(this: Memory, start: number, end: number) {
        return this.m_Memory.slice(start, end);
    };
```