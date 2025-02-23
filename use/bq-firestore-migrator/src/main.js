import migrator from './controller/migrator.js';

const main = async () => {
    await migrator.run();
};

main();
