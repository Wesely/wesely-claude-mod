export type Label = string

declare module 'claude-code' {
  interface PluginState {
    usage: { label: Label; usageText: string }
  }
}
