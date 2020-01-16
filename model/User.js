const user = (id = null, firstName, lastName, emailId, address1, city, state, zip, country) => {
    return {
      userId: id,
      firstName: firstName,
      lastName: lastName,
      emailId: emailId,
      address1: address1,
      city: city,
      state: state,
      zip: zip,
      country: country
    };
  }
module.exports.user = user;