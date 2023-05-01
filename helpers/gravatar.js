import gravatar from "gravatar";

export const userAvatar = async (email) => {
  try {
    const avatar = await gravatar.url(email, { s: "100", r: "g", d: "robohash" });
       return avatar;
  } catch (error) {
    console.log(error);
  }
};
