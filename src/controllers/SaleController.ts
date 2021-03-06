import { Request, Response } from "express";
import ClientService from "../services/ClientService";
import EmploeeService from "../services/EmploeeService";
import SaleService from "../services/SaleService";
import VehicleService from "../services/VehicleService";
import { ErrorServer, ErrorValidation, SuccessResponse } from "../types/responses";
import EmploeeValidator from "../validators/EmploeeValidator";
import SaleValidator from "../validators/SaleValidator";
import { validationPagination } from "../validators/validations/validationPagination";
import SaleView from "../views/SaleView";


class SaleController {
  async createSale(request: Request, response: Response): Promise<Response>{
    const { clientId, emploeeId, vehicleId } = request.body;
    const validation = await SaleValidator.createValidation({ clientId, emploeeId, vehicleId });

    if(!validation.isValid){
      const res: ErrorValidation = {message: "Campos invalidos", type: "error validation", errors: validation.errors};
      return response.status(403).json(res);
    }

    try {
      const client = await ClientService.findClientById(clientId);
      if(!client){
        const res: ErrorValidation = {message: "Cliente não encontrado", type: "error validation", errors: []};
        return response.status(403).json(res);
      }

      const vehicle =  await VehicleService.findVehicleById(vehicleId);
      if(!vehicle){
        const res: ErrorValidation = {message: "Veiculo não encontrado", type: "error validation", errors: []};
        return response.status(403).json(res);
      }

      const emploee =  await EmploeeService.findEmploeeById(emploeeId);
      if(!emploee){
        const res: ErrorValidation = {message: "Funcionario não encontrado", type: "error validation", errors: []};
        return response.status(403).json(res);
      }

      const validationSale = await SaleService.validationSaleVehicle(vehicle, client);
      if(!validationSale.isValid){
        const res: ErrorValidation = {message: "Não foi possivel realizar a venda", type: "error validation", errors: validationSale.errors};
        return response.status(403).json(res);
      }

      const saleCreated = await SaleService.createSale({
        clientId,
        vehicleId,
        emploeeId,
        valueSale: vehicle.salePrice
      });

      const saleReturned = SaleView.saleView(saleCreated);
      const res: SuccessResponse = {message: "Venda realizada sucesso", type: "success", body: saleReturned};
      return response.status(201).json(res);

    } catch (error) {
      const res: ErrorServer = {message: "Erro no servidor", type: "error server", errors: []};
      return response.status(500).json(res);
    }

  }

  async listSales(request: Request, response: Response): Promise<Response>{
    const { page = 1, limit = 10 } = request.query;
    const validation = validationPagination(Number(page), Number(limit));

    try {
      const sales = await SaleService.findAllSales(validation.page, validation.limit);
      const salesReturned = SaleView.salesByJoinView(sales);
      const res: SuccessResponse = {message: "Listagem de Vendas", type: "success", body: salesReturned};
      return response.status(200).json(res);

    } catch (error) {
      const res: ErrorServer = {message: "Erro no servidor", type: "error server", errors: []};
      return response.status(500).json(res);
    }
  }

  async findSalesByEmploee(request: Request, response: Response): Promise<Response>{
    const { emploeeId } = request.params;
    const { page = 1, limit = 10} = request.query;
    const pagination = validationPagination(Number(page), Number(limit));
    const validation = await EmploeeValidator.idValidation(emploeeId);
    if(!validation.isValid){
      const res: ErrorValidation = {message: "Funcionario não valido", type: "error validation", errors: validation.errors};
      return response.status(403).json(res);
    }

    try {
      const emploee = await EmploeeService.findEmploeeById(emploeeId);
      if(!emploee){
        const res: ErrorValidation = {message: "Funcionario não encontrado", type: "error validation", errors: validation.errors};
        return response.status(403).json(res);
      }

      const sales = await SaleService.findSalesByEmploee(emploeeId, pagination.page, pagination.limit);
      const salesReturned = SaleView.salesByJoinView(sales);
      const res: SuccessResponse = {message: `Vendas realizadas pelo funcionario ${emploee.name}`, type: "success", body: salesReturned};
      return response.status(200).json(res);

    } catch (error) {
      const res: ErrorServer = {message: "Erro no servidor", type: "error server", errors: []};
      return response.status(500).json(res);
    }
  }
}

export default new SaleController();
