export enum Boolean
{
    True = -1,
    False = 0
}

export type SegmentType = "constant" | "local" | "argument" | "this" | "that" | "temp" | "pointer" | string; // string: *.static

export enum MemoryAddress
{
    StackPointer = 0,
    Local = 1,
    Argument = 2,
    This = 3,
    That = 4,
    Temp = 5,
    Static = 16
}

export enum DefaultConfig
{
    StackPointerAddress = 256,
    MemorySize = (1024 + 512) * 16,
    ScreenAddress = 16384,
    PixelCount = 256 * 32
}