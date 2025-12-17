import React from "react";
import Svg, { Path, Circle, Rect, G } from "react-native-svg";
import { View } from "react-native";

// icon: object exported from @carbon/icons (es/*/24.js)
const renderElem = (elem, idx, color) => {
  const { elem: type, attrs = {}, content = [] } = elem;
  if (type === "path") {
    return <Path key={idx} d={attrs.d} fill={attrs.fill || color} />;
  }
  if (type === "circle") {
    return (
      <Circle
        key={idx}
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
        key={idx}
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
      <G key={idx}>
        {content.map((c, i) => renderElem(c, `${idx}-${i}`, color))}
      </G>
    );
  }
  return null;
};

const CarbonIcon = ({ icon, size = 20, color = "#fff", style }) => {
  if (!icon || !icon.attrs) return <View style={style} />;

  const viewBox =
    icon.attrs.viewBox || `0 0 ${icon.size || size} ${icon.size || size}`;

  return (
    <Svg width={size} height={size} viewBox={viewBox} style={style}>
      {Array.isArray(icon.content)
        ? icon.content.map((c, i) => renderElem(c, i, color))
        : null}
    </Svg>
  );
};

export default CarbonIcon;
