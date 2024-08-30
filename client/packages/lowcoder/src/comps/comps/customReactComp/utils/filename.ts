export const splitFileName = (filename: string) => {
  const baseIdx = filename.lastIndexOf('/')
  const idx = filename.lastIndexOf('.')
  if (idx <= baseIdx) return [filename, '']
  return [filename.substring(0, idx), filename.substring(idx + 1)]
}
