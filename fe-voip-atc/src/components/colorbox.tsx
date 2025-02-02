export default function ColorBox({
  color,
  isSelected,
  onClick,
}: {
  color: "primary" | "secondary" | "tersier";
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className="w-[150px] md:w-[280px] h-auto bg-white px-3 md:px-6 pt-3 md:pt-6 pb-2 md:pb-3 flex flex-col items-start rounded-xl gap-5 shadow-xl"
      onClick={onClick}
    >
      <div
        className={`w-full h-[112px] md:h-[180px] ${
          color == "primary"
            ? "bg-primary-900"
            : color == "secondary"
            ? "bg-light-900"
            : "bg-navy-900"
        } rounded-lg`}
      ></div>
      <label className="flex items-center gap-2">
        <input
          type="radio"
          value={color}
          checked={isSelected}
          className="radio-button"
          readOnly
        />
        <span className="text-[12px] md:text-[16px] font-medium text-[#414651]">
          {color == "primary"
            ? "Primary"
            : color == "secondary"
            ? "Secondary"
            : "Tersier"}{" "}
          Color
        </span>
      </label>
    </div>
  );
}
