function userConnection (connection, rsvp) {
    return {
      connection: connection,
      rsvp: rsvp
    };
  }
//   const _userConnection = userConnection;
// export { _userConnection as userConnection };
module.exports.userConnection = userConnection;