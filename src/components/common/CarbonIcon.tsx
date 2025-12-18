import React from "react";
import Svg, { Path, Circle, Rect, G } from "react-native-svg";
import { View, StyleProp, ViewStyle } from "react-native";

interface IconElement {
  elem: string;
  attrs?: any;
  content?: IconElement[];
}

interface CarbonIconType {
  attrs?: {
    viewBox?: string;
  };
  content?: IconElement[];
  size?: number;
}

// icon: object exported from @carbon/icons (es/*/24.js)
const renderElem = (elem: IconElement, idx: string | number, color: string): any => {
  const { elem: type, attrs = {}, content = [] } = elem;
  if (type === "path") {
    return <Path d={attrs.d} fill={attrs.fill || color} />;
  }
  if (type === "circle") {
    return (
      <Circle
        cx={attrs.cx}
        cy={attrs.cy}
        r={attrs.r}
        fill={attrs.fill || color}
      />
    );
  }
  if (type === "rect") {
    return (
      <Rect
        x={attrs.x}
        y={attrs.y}
        width={attrs.width}
        height={attrs.height}
        fill={attrs.fill || color}
      />
    );
  }
  if (type === "g") {
    return (
      <G>
        {content.map((c: IconElement, i: number) => renderElem(c, `${idx}-${i}`, color))}
      </G>
    );
  }
  return null;
};

interface CarbonIconProps {
  icon: CarbonIconType;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

const CarbonIcon = ({ icon, size = 20, color = "#fff", style }: CarbonIconProps) => {
  if (!icon || !icon.attrs) return <View style={style} />;

  const viewBox =
    icon.attrs.viewBox || `0 0 ${icon.size || size} ${icon.size || size}`;

  return (
    <Svg width={size} height={size} viewBox={viewBox} style={style}>
      {Array.isArray(icon.content)
        ? icon.content.map((c: IconElement, i: number) => renderElem(c, i, color))
        : null}
    </Svg>
  );
};

export default CarbonIcon;
