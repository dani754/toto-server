const DBinfo = {
    client: 'pg',
    connection: {
        host : 'ec2-107-22-83-3.compute-1.amazonaws.com',
        user : 'ynixgvbfswdsqk',
    password : 'e2d91205df091bfb893773c80195df3dc7709e433cd43c5f65b130d594914c86',
    database : 'de58s11ekq6m92',
    ssl: { rejectUnauthorized: false }
    }
};

const get = () => {
    return DBinfo;
}

exports.get = get;