const _byteToHex = [];
for (let i = 0; i < 256; i++) {
    _byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function unparse(buf, offset) {
    let i = offset || 0, bth = _byteToHex;

    return bth[buf[i++]] + bth[buf[i++]] +
        bth[buf[i++]] + bth[buf[i++]] + '-' +
        bth[buf[i++]] + bth[buf[i++]] + '-' +
        bth[buf[i++]] + bth[buf[i++]] + '-' +
        bth[buf[i++]] + bth[buf[i++]] + '-' +
        bth[buf[i++]] + bth[buf[i++]] +
        bth[buf[i++]] + bth[buf[i++]] +
        bth[buf[i++]] + bth[buf[i++]];
}

function uuidValidator (uuid, version) {
    let parsedUuid;

    // Regular expression used for basic parsing of the uuid.
    const pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    // If the uuid is a biffer, parse it...
    if (Buffer.isBuffer(uuid)) {
        parsedUuid = unparse(uuid);
    } else if (Object.prototype.toString.call(uuid) === '[object String]') {
        parsedUuid = uuid;
    } else {
        return false;
    }

    parsedUuid = parsedUuid.toLowerCase();

    // All UUIDs fit a basic schema. Match that.
    if (!pattern.test(parsedUuid)) {
        return false;
    }

    // Now extract the version...
    if (version === undefined) {
        version = extractVersion(parsedUuid);
    } else if (extractVersion(parsedUuid) !== version) {
        return false;
    }

    switch (version) {
        // For certain versions, the checks we did up to this point are fine.
        case 1:
        case 2:
            return true;

        // For versions 3 and 4, they must specify a variant.
        case 3:
        case 4:
        case 5:
            return ['8', '9', 'a', 'b'].indexOf(parsedUuid.charAt(19)) !== -1;

        default:
            // We should only be able to reach this if the consumer explicitly
            // provided an invalid version. Prior to extractVersion we check
            // that it's 1-4 in the regex.
            throw new Error('Invalid version provided.');
    }
};

function extractVersion(uuid) {
    return uuid.charAt(14)|0;
};

module.exports = {
    uuidValidator,
    extractVersion
}