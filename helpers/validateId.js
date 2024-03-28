// function to check if passed id is a valid MongoDB ObjectId
// function validateId(id) {
//   return /^[0-9a-fA-F]{24}$/.test(id);
// }

function isValidObjectId(id) {
  if (!id || typeof id !== "string" || id.length !== 24) {
    return false;
  }

  for (let i = 0; i < id.length; i += 2) {
    const hexChar = id.substring(i, i + 2);
    if (!/^[0-9A-F]+$/i.test(hexChar)) {
      return false;
    }
  }

  return true;
}

module.exports = isValidObjectId;
