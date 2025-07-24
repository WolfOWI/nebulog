import Color from "color";

/**
 * Returns a colour that is appropriate for an icon on a background colour.
 * @param bgColour - The background colour to get an icon colour for.
 * @returns A colour that is appropriate for an icon on a background colour.
 */
export const getIconColourFromBgColour = (bgColour: string): string => {
  const colour = Color(bgColour);
  const brightness = colour.luminosity();

  if (brightness === 0) {
    return "#FFFFFF";
  }

  // Very dark backgrounds
  if (brightness < 0.1) {
    return colour.lighten(10).saturate(0.3).hex();
  }

  if (brightness > 0.4) {
    // Light background - use dark color with some saturation
    return colour.darken(0.8).saturate(0.3).hex();
  } else {
    // Dark background - use light color with some saturation
    return colour.lighten(0.8).saturate(0.3).hex();
  }
};
