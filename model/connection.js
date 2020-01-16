function connection(id, name, topic, details, datetime, userId) {
  return {
    connectionID: id,
    connectionName: name,
    topic: topic,
    details: details,
    datetime: datetime,
    userId: userId
  };
}
module.exports.connection = connection;