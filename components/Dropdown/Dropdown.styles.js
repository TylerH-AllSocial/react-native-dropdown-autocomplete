import {StyleSheet, Platform} from "react-native";
import {theme} from "../../constants/Theme";

export default StyleSheet.create({
  accessory: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  triangle: {
    width: 8,
    height: 8,
    transform: [
      {
        translateY: -4,
      },
      {
        rotate: "45deg",
      },
    ],
  },
  triangleContainer: {
    width: 12,
    height: 6,
    overflow: "hidden",
    alignItems: "center",

    backgroundColor: "transparent" /* XXX: Required */,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  picker: {
    backgroundColor: "rgba(255, 255, 255, 1.0)",
    borderRadius: 2,
    position: "absolute",
    ...Platform.select({
      ios: {
        shadowRadius: 2,
        shadowColor: theme.textSubtitle,
        shadowOpacity: 0.8,
        shadowOffset: {width: 4, height: 6},
      },

      android: {
        elevation: 6,
      },
    }),
  },
  item: {
    textAlign: "left",
  },
  scroll: {
    flex: 1,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: theme.primary,
  },
  separator: {
    height: 1,
    backgroundColor: theme.dividerColor,
  },
  listItem: {
    paddingLeft: 15,
    paddingTop: 6,
    height: 41,
    justifyContent: "center",
  },
  listFooter: {
    height: 16.7,
    borderTopWidth: 1,
    borderTopColor: theme.dividerColor,
  },
  listHeader: {
    height: 41.8,
    justifyContent: "center",
    paddingTop: 0,
    backgroundColor: theme.bgPrimary,
    borderBottomWidth: 1,
    borderBottomColor: theme.primary,
  },
  listItemText: {
    justifyContent: "center",
    color: theme.listItemColor,
  },
  noData: {
    color: theme.dividerColor,
  },
  listHeaderText: {
    color: theme.textSubtitle,
  },
  phones: {
    display: "flex",
    flexDirection: "column",
    paddingRight: 8,
  },
  phone: {
    color: theme.dividerColor,
    textDecorationLine: "underline",
    textDecorationStyle: "solid",
    textDecorationColor: theme.dividerColor,
  },
});