const mdlinks = require('../index')


describe('Funcion mdLinks', () => {

    it('Debería se una función', () => {
        return expect(typeof mdlinks).toEqual('function')
    });
    describe('Probando funciones mdLinks', () => {

        it('mdLinks(".\\test\\").then() debería retornar [{ href,file,text }]', () => {
            const options = {
                stats: false,
                validate: false
            }
            return mdlinks('.\\test\\archivo.md', options)
                .then(result => {
                    expect(result[0])
                        .toEqual(
                            {
                                href: 'https://es.wikipedia.org/wiki/Markdown',
                                file: '.\\test\\archivo.md',
                                text: 'Markdown'
                            }
                        )
                })

        });
        statusCode: 200

    });
});
