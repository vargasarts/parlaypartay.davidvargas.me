const verifyAdminUser = (userId: string) =>
  import("@clerk/clerk-sdk-node")
    .then((clerk) => clerk.users.getUser(userId))
    .then((user) => {
      return user.emailAddresses.some((u) =>
        u.emailAddress?.endsWith("davidvargas.me")
      );
    });

export default verifyAdminUser;
