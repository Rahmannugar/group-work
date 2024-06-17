import { Typography, useTheme } from "@mui/material";
import FlexBetween from "components/FlexBetween";
import WidgetWrapper from "components/WidgetWrapper";

const AdvertWidget = () => {
  const { palette } = useTheme();
  const dark = palette.neutral.dark;
  const main = palette.neutral.main;
  const medium = palette.neutral.medium;

  return (
    <WidgetWrapper>
      <FlexBetween>
        <Typography color={dark} variant="h5" fontWeight="500">
          Sponsored
        </Typography>
        <Typography color={medium}>Create Ad</Typography>
      </FlexBetween>
      <img
        width="100%"
        height="auto"
        alt="advert"
        src="https://www.unilorin.edu.ng/wp-content/uploads/2021/06/home2.jpg"
        style={{ borderRadius: "0.75rem", margin: "0.75rem 0" }}
      />
      <FlexBetween>
        <Typography color={main}>University of Ilorin</Typography>
        <Typography color={medium}>
          <a href="https://www.unilorin.edu.ng" target="_blank" rel="noopener noreferrer">
            unilorin.edu.ng
          </a>
        </Typography>
      </FlexBetween>
      <Typography color={medium} m="0.5rem 0">
        Due to the extension of the application period for Postgraduate programmes for the 2023/2024 Academic Session till 30th June. The qualifying examination earlier slated for the 8th of June 2024 is hereby postponed. A new date will be communicated later!!!
      </Typography>
    </WidgetWrapper>
  );
};

export default AdvertWidget;
