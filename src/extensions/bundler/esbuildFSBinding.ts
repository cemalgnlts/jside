import { Uri, workspace, window, FileType } from "vscode";
import type { FileStat } from "vscode";
import Logger from "../../utils/logger";

export const logger = new Logger(window, "Bundler");

// https://github.com/esbuild/esbuild.github.io/blob/main/src/try/fs.ts

const projectFolderUri: Uri = workspace.workspaceFolders![0].uri;

const EBADF = errorWithCode("EBADF");
const EINVAL = errorWithCode("EINVAL");
const EISDIR = errorWithCode("EISDIR");
// const ENOENT = errorWithCode("ENOENT");
const ENOTDIR = errorWithCode("ENOTDIR");

const fileDescriptors: Map<number, { path: string; offset: number; isDir: boolean }> = new Map();
let nextFDNum = 3; // 0, 1, 2 reserved

// The "esbuild-wasm" package overwrites "fs.writeSync" with this value
let esbuildWriteSync: (
  fd: number,
  buffer: Uint8Array,
  offset: number,
  length: number,
  position: number | null
) => void;

// The "esbuild-wasm" package overwrites "fs.read" with this value
let esbuildRead: (
  fd: number,
  buffer: Uint8Array,
  offset: number,
  length: number,
  position: number | null,
  callback: (err: Error | null, count: number, buffer: Uint8Array) => void
) => void;

class Stats {
  public dev = 1;
  public ino = 0;
  public nlink = 1;
  public uid = 1;
  public gid = 1;
  public rdev = 0;
  public blksize = 4096;
  public atimeMs = Date.now();
  public mtimeMs = Date.now();
  public ctimeMs = Date.now();
  public birthtimeMs = Date.now();
  public atime = new Date();
  public mtime = new Date();
  public ctime = new Date();
  declare blocks: number;
  declare mode: number;
  declare size: number;

  constructor(stats?: FileStat | undefined) {
    this.mode = stats?.type === FileType.File ? 0o100000 : 0o40000;
    this.size = stats?.size ?? 0;
    this.blocks = (this.size + (this.blksize - 1)) & (this.blksize - 1);
  }

  isDirectory(): boolean {
    return this.mode === 0o40000;
  }

  isFile(): boolean {
    return this.mode === 0o100000;
  }
}

function writeSync(fd: number, buffer: Uint8Array, offset: number, length: number, position: number | null) {
  if (fd <= 2) {
    if (fd === 2) logger.append(buffer);
    else esbuildWriteSync(fd, buffer, offset, length, position);
  } else {
    throw EINVAL;
  }
}

function read(
  fd: number,
  buffer: Uint8Array,
  offset: number,
  length: number,
  position: number | null,
  callback: (err: Error | null, count: number, buffer: Uint8Array) => void
): void {
  if (fd <= 2) {
    return esbuildRead(fd, buffer, offset, length, position, callback);
  }

  if (!fileDescriptors.has(fd)) return callback(EBADF, 0, buffer);

  // eslint-disable-next-line prefer-const
  const entry = fileDescriptors.get(fd)!;

  if(entry.isDir) return callback(EISDIR, 0, buffer);

  const handleError = (name: string) => {
    if (name === "TypeMismatchError") return callback(EISDIR, 0, buffer);

    callback(new Error(name), 0, buffer);

    throw name;
  };

  workspace.fs.readFile(Uri.file(entry.path)).then(
    (content) => {
      let slice: Uint8Array;

      if (position !== null && position !== -1) {
        slice = content.slice(position, position + length);
      } else {
        slice = content.slice(entry.offset, entry.offset + length);
        entry.offset += slice.length;
      }

      buffer.set(slice, offset);
      callback(null, slice.length, buffer); 
    },
    (err) => handleError(err.name)
  );
}

type ErrorWithCode = Error & { code: string };

function errorWithCode(code: string): Error {
  const err = new Error(code) as ErrorWithCode;
  err.code = code;
  return err;
}

async function stats(path: string) {
  if (projectFolderUri.path.startsWith(path)) return new Stats();

  const stat = await workspace.fs.stat(Uri.file(path));

  return new Stats(stat);
}

// @ts-expect-error Element implicitly has an "any" type
globalThis.fs = {
  constants: {
    O_WRONLY: -1,
    O_RDWR: -1,
    O_CREAT: -1,
    O_TRUNC: -1,
    O_APPEND: -1,
    O_EXCL: -1
  },

  get writeSync() {
    return writeSync;
  },
  set writeSync(value) {
    esbuildWriteSync = value;
  },

  get read() {
    return read;
  },
  set read(value) {
    esbuildRead = value;
  },

  open(
    path: string,
    _flags: string | number,
    _mode: string | number,
    callback: (err: Error | null, fd: number | null) => void
  ) {
    const fd = nextFDNum++;
    const absPath = path === "/" ? "/JSIDE" : path;
    
    workspace.fs.stat(Uri.file(absPath)).then(res => {
      fileDescriptors.set(fd, {
        path: absPath,
        offset: 0,
        isDir: res.type === FileType.Directory
      });

      callback(null, fd);
    });
  },
  close(fd: number, callback: (err: Error | null) => void) {
    callback(fileDescriptors.delete(fd) ? null : EBADF);
  },

  readdir(path: string, callback: (err: Error | null, files: string[] | null) => void) {
    workspace.fs.readDirectory(Uri.file(path)).then(
      (dirs) => {
        const files = dirs.map(([fileName]) => fileName);
        callback(null, files);
      },
      (err) => callback(err, null)
    );
  },

  stat(path: string, callback: (err: Error | null, stats: Stats | null) => void) {
    // Esbuild will check if there are windows. We are using a Unix file path.
    if (path === "C:\\") return callback(ENOTDIR, null);

    stats(path)
      .then((res) => callback(null, res))
      .catch((err) => callback(errorWithCode(err), null));
  },
  lstat(path: string, callback: (err: Error | null, stats: Stats | null) => void) {
    stats(path)
      .then((res) => callback(null, res))
      .catch((err) => callback(errorWithCode(err), null));
  },
  fstat(fd: number, callback: (err: Error | null, stats: Stats | null) => void) {
    if (!fileDescriptors.has(fd)) return callback(EBADF, null);

    const entry = fileDescriptors.get(fd)!;

    stats(entry.path)
      .then((res) => callback(null, res))
      .catch((err) => callback(errorWithCode(err), null));
  },

  write(
    fd: number,
    buffer: Uint8Array,
    offset: number,
    length: number,
    position: number | null,
    callback: (err: Error | null, count: number, buffer: Uint8Array) => void
  ) {
    if (fd <= 2) {
      if (fd === 2) logger.append(buffer);
      else esbuildWriteSync(fd, buffer, offset, length, position);
      callback(null, length, buffer);
    } else {
      callback(EINVAL, 0, buffer);
    }
  }
};
