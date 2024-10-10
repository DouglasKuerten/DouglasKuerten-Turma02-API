import pactum from 'pactum';
import { SimpleReporter } from '../simple-reporter';
import { StatusCodes } from 'http-status-codes';
import { faker } from '@faker-js/faker';

describe('API Mercado QA', () => {
    const p = pactum;
    const rep = SimpleReporter;
    const baseUrl = 'https://api-desafio-qa.onrender.com';

    let idMercado = null;

    p.request.setDefaultTimeout(30000);

    beforeAll(() => p.reporter.add(rep));
    afterAll(() => p.reporter.end());

    it('Verificar se a API consegue retornar todos os dados do mercado', async () => {
        await p.spec()
            .get(`${baseUrl}/mercado`)
            .expectStatus(StatusCodes.OK)
    });
    it('Adicionar um novo mercado', async () => {
        idMercado = await p.spec()
            .post(`${baseUrl}/mercado`)
            .withJson({
                nome: faker.company.name(),
                cnpj: faker.string.numeric(14),
                endereco: faker.location.streetAddress(),
            })
            .expectStatus(StatusCodes.CREATED)
            .returns(returned => returned.res.body.novoMercado.id);
    });
    it('Adicionar um novo mercado com cnpj inválido', async () => {
        await p.spec()
            .post(`${baseUrl}/mercado`)
            .withJson({
                nome: faker.company.name(),
                cnpj: faker.string.numeric(10),
                endereco: faker.location.streetAddress(),
            })
            .expectStatus(StatusCodes.BAD_REQUEST)
            .expectBodyContains(`CNPJ deve ter 14 dígitos`);
    });
    it('Buscar o mercado adicionado', async () => {
        await p.spec()
            .get(`${baseUrl}/mercado/${idMercado}`)
            .expectStatus(StatusCodes.OK)
    });
    it('Buscar um mercado inexistente', async () => {
        await p.spec()
            .get(`${baseUrl}/mercado/0`)
            .expectStatus(StatusCodes.NOT_FOUND)
            .expectBodyContains('O mercado com o ID fornecido não foi encontrado.');

    });
    it('Atualizar o mercado adicionado', async () => {
        await p.spec()
            .put(`${baseUrl}/mercado/${idMercado}`)
            .withJson({
                nome: faker.company.name(),
                cnpj: faker.string.numeric(14),
                endereco: faker.location.streetAddress(),
            })
            .expectStatus(StatusCodes.OK)
    });

    it('Adicionar um novo produto na categoria de hortifruit frutas do mercado ', async () => {
        await p.spec()
            .post(`${baseUrl}/mercado/${idMercado}/produtos/hortifruit/frutas`)
            .withJson({
                nome: faker.food.fruit(),
                valor: faker.number.int(),
            })
            .expectStatus(StatusCodes.CREATED)
    });

    it('Adicionar um novo produto na categoria de hortifruit frutas do mercado com um valor negativo', async () => {
        await p.spec()
            .post(`${baseUrl}/mercado/${idMercado}/produtos/hortifruit/frutas`)
            .withJson({
                nome: faker.food.fruit(),
                valor: -1,
            })
            .expectStatus(StatusCodes.BAD_REQUEST)
            .expectBodyContains(`Valor deve ser um número inteiro e não negativo`);
    });
    it('Adicionar um novo produto na categoria de hortifruit vegetais do mercado', async () => {
        await p.spec()
            .post(`${baseUrl}/mercado/${idMercado}/produtos/hortifruit/legumes`)
            .withJson({
                nome: faker.food.vegetable(),
                valor: faker.number.int(),
            })
            .expectStatus(StatusCodes.CREATED)
    });
    it('Adicionar um novo produto na categoria de hortifruit vegetais do mercado com um valor negativo', async () => {
        await p.spec()
            .post(`${baseUrl}/mercado/${idMercado}/produtos/hortifruit/legumes`)
            .withJson({
                nome: faker.food.vegetable(),
                valor: -1,
            })
            .expectStatus(StatusCodes.BAD_REQUEST)
            .expectBodyContains(`Valor deve ser um número inteiro e não negativo`);
    });


    it('Verificar se a API consegue retornar todos os produtos de um mercado', async () => {
        await p.spec()
            .get(`${baseUrl}/mercado/${idMercado}/produtos`)
            .expectStatus(StatusCodes.OK)
    });

    it('Deletar um mercado que não existe', async () => {
        await p.spec()
            .delete(`${baseUrl}/mercado/0`)
            .expectStatus(StatusCodes.NOT_FOUND)
            .expectBodyContains(`O mercado com o ID fornecido não foi encontrado.`);
    });
    it('Deletar o mercado adicionado', async () => {
        await p.spec()
            .delete(`${baseUrl}/mercado/${idMercado}`)
            .expectStatus(StatusCodes.OK)
            .expectBodyContains(`Mercado com ID ${idMercado} foi removido com sucesso.`);
    });


});