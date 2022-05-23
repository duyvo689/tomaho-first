const realmObjectModel = {
    name: 'User',
    properties: {
        _id: 'objectId',
        _partition: 'string',
        name: 'string',
        birthday: { type: 'date', optional: true }, // developers set optional: true to adhere to the new requirement
    },
    primaryKey: '_id'
};