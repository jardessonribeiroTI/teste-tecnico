import { Op } from "sequelize";
import { Emploee } from "../models/Emploee";

class EmploeeService{
  async createEmploee(emploee): Promise<Emploee>{
    try {
      const emploeeCreated = await Emploee.create(emploee);
      return emploeeCreated;
    } catch (error) {
      throw new Error();
    }
  }

  async findEmploeeByCPFAndEmail(cpf: string, email: string): Promise<Emploee>{
    try {
      const emploee = await Emploee.findOne({where:{ [Op.or]: {cpf, email}}});
      return emploee;
    } catch (error) {
      throw new Error();
    }
  }

  async findAllEmploees(page: number, limit: number): Promise<Emploee[]>{
    const offSet = (page - 1) * limit;
    limit = limit * page;
    try {
      const emploees = await Emploee.findAll({limit: limit, offset: offSet});
      return emploees;
    } catch (error) {
      throw new Error();
    }
  }

  async findEmploeeById(emploeeId: string): Promise<Emploee>{
    try {
      const emploee = await Emploee.findOne({where: {id: emploeeId}});
      return emploee;
    } catch (error) {
      throw new Error();
    }
  }

  async findEmploeeByCPF(cpf: string): Promise<Emploee>{
    try {
      const emploee = await Emploee.findOne({where: {cpf}});
      return emploee;
    } catch (error) {
      throw new Error();
    }
  }

  async updateEmploee(emploee): Promise<any>{
    const { name, email, password, biography, emploeeId} = emploee;
    try {
      const emploeeUpdated = await Emploee.update({
        name,
        email,
        password,
        biography
      }, {
        where: {
          id: emploeeId
        }
      });

      return emploeeUpdated;
    } catch (error) {
      throw new Error();
    }
  }
}

export default new EmploeeService;
