import Contact from "./contactSchema.js";

export const listContacts = async (page, limit, filter) => {
  try {
    const contacts = await Contact.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .find(filter);
    return contacts;
  } catch (error) {
    console.error(error);
  }
};

export const getContactById = async (contactId) => {
  try {
    const contacts = await listContacts();
    const contact = contacts.find((contact) => contact.id === contactId);
    return contact;
  } catch (error) {
    console.error(error);
  }
};

export const removeContact = async (contactId) => {
  try {
    const removedContact = await Contact.findByIdAndRemove(contactId);
    console.log(`Contact with ID ${contactId} removed`);
    return removedContact;
  } catch (error) {
    console.error(error);
  }
};

export const addContact = async (body) => {
  try {
    const newContact = new Contact(body);
    const result = await newContact.save();
    console.log("New contact added");
    return result;
  } catch (error) {
    console.error(error);
  }
};

export const updateContact = async (contactId, body) => {
  try {
    const updatedContact = await Contact.findByIdAndUpdate(contactId, body, {
      new: true,
    });
    console.log(updatedContact);
    console.log(`Contact with ID ${contactId} updated`);
    return updatedContact;
  } catch (error) {
    console.error(error);
  }
};

export const updateStatusContact = async (contactId, favorite) => {
  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      contactId,
      { $set: favorite },
      { new: true }
    );
    return updatedContact;
  } catch (error) {
    console.error(error);
    return null;
  }
};
