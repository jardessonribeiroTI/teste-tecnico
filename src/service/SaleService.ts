import { Client } from "../models/Client";
import { Emploee } from "../models/Emploee";
import { Sale } from "../models/Sale";
import { Vehicle } from "../models/Vehicle";
import { validation } from "../types/validation";

class SaleService {
  async createSale(sale: any): Promise<Sale>{
    try {
      const saleCreated = await Sale.create(sale);
      return saleCreated;
    } catch (error) {
      throw new Error();
    }
  }

  async findAllSales(page: number, limit: number): Promise<Sale[]>{
    const offSet = (page - 1) * limit;
    limit = limit * page;
    try {
      const sales = await Sale.findAll({limit: limit, offset: offSet, include: [Vehicle, Client, Emploee]});
      return sales;
    } catch (error) {
      throw new Error();
    }
  }

  async findSalesByEmploee(emploeeId: string, page: number, limit: number): Promise<Sale[]>{
    const offSet = (page - 1) * limit;
    limit = limit * page;

    try {
      const sales = await Sale.findAll({limit: limit, offset: offSet, include: [Vehicle, Client, Emploee], where: {emploeeId}});
      return sales;
    } catch (error) {
      throw new Error();
    }
  }

  async validationSaleVehicle(vehicle: Vehicle, client: Client): Promise<validation>{
    if(vehicle.status === "disponivel"){
      return {isValid: true, errors: []}
    }
    if(vehicle.status === "vendido"){
      return {isValid: false, errors: ["Veiculo com status vendido"]};
    }

    if(vehicle.status === "reservado"){
      const reserva = {clientId: "58dd-d5dd-d4d4d-d4d4d5d"}
    }
    return null;
  }
}

export default new SaleService();
