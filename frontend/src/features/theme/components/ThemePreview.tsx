import { ThemeColors } from "../constants/themeConfigs";

export function ThemePreview({ colors }: { colors: ThemeColors }) {
  return (
    <div
      className={`w-full h-36 p-3 flex flex-col gap-2 border-b border-border/10 ${colors.wrapper}`}
    >
      <div
        className={`w-full h-5 rounded-md flex items-center px-2 gap-1.5 border ${colors.header}`}
      >
        <div className={`w-2 h-2 rounded-full ${colors.dots}`} />
        <div className={`w-2 h-2 rounded-full ${colors.dots}`} />
        <div className={`w-8 h-2 rounded-full ml-2 ${colors.lines}`} />
      </div>

      <div className="flex gap-2 flex-1">
        <div className={`w-1/4 h-full rounded-md flex flex-col gap-1.5 p-1.5 ${colors.sidebar}`}>
          <div className={`w-full h-2 rounded-full ${colors.lines}`} />
          <div className={`w-3/4 h-2 rounded-full ${colors.lines}`} />
          <div className={`w-1/2 h-2 rounded-full mt-2 ${colors.lines}`} />
        </div>

        <div
          className={`w-3/4 h-full rounded-md border p-2 flex flex-col gap-1.5 ${colors.content}`}
        >
          <div className={`w-1/3 h-2.5 rounded-full ${colors.primaryLine}`} />
          <div className={`w-full h-1.5 rounded-full mt-1 ${colors.contentLines}`} />
          <div className={`w-5/6 h-1.5 rounded-full ${colors.contentLines}`} />
          <div className={`w-4/6 h-1.5 rounded-full ${colors.contentLines}`} />
        </div>
      </div>
    </div>
  );
}
