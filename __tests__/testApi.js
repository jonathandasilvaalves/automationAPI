const frisby = require("frisby");
const Joi = frisby.Joi;
const constant = require("../constant");
const baseUrl = constant.baseUrl;
const faker = require("faker");

describe("Test API", () => {
  beforeAll(() => {
    json = {
      email: faker.internet.email(),
      password: faker.internet.password()
    };
    
    return frisby
      .post(`${baseUrl}/auth/registrar`, json)
      .expect("status", 201)
      .then(res => {
        const token = res.json.token;

        return frisby.globalSetup({
          request: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        });
      });
  });

  it("Login Request", () => {
    json = {
      email: "paulo@email.com",
      password: "paulo"
    };

    return frisby
      .post(`${baseUrl}/auth/login`, json)
      .expect("status", 200)
      .then(res => {
        const token = res.json.token;

        return frisby
          .setup({
            request: {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          })
          .get(`${baseUrl}/turmas`)
          .expect("status", 200);
      });
  });

  it("Validation of the class GET", () => {
    json = {
      email: "paulo@email.com",
      password: "paulo"
    };

    return frisby
      .get(`${baseUrl}/turmas/2`)
      .expect("status", 200)
      .then(res => {
        const horario = res.json.idHorario;
        return frisby.get(`${baseUrl}/horarios/${horario}`).expect("json", {
          quarta: { idDisciplina: 6 }
        });
      });
  });

  it("Request GET", () => {
    return frisby
      .get(`${baseUrl}/turmas/1`)
      .expect("status", 200)
      .expect("header", "x-content-type-options", "nosniff")
      .expect("jsonTypes", {
        id: Joi.number(),
        descricao: Joi.string(),
        idHorario: Joi.number(),
        alunos: Joi.array(),
        idAluno: Joi.number()
      });
  });

  it("Create teacher", () => {
    json = {
      id: 9,
      idDisciplina: 10,
      nome: "Jonathan"
    };

    return frisby
      .post(`${baseUrl}/professores`, json)
      .setup({
        request: {
          headers: {
            Authorization:
              "Basic " + Buffer.from("username:password").toString("base64")
          }
        }
      })
      .expect("status", 201)
      .expect("json", json)
      .then(() => {
        return frisby
          .del(`${baseUrl}/professores/${json.id}`)
          .expect("status", 200)
          .then(() => {
            return frisby
              .get(`${baseUrl}/professores/${json.id}`)
              .expect("status", 404);
          });
      });
  });
  
  it("Changing teacher", () => {
    json = {
      idDisciplina: 7,
      nome: "Jonathan"
    };

    let id = 1;

    return frisby
      .put(`${baseUrl}/professores/${id}`, json)
      .expect("status", 200)
      .expect("json", {
        id: id,
        idDisciplina: json.idDisciplina,
        nome: json.nome
      });
  });
});
