import { Request, Response } from "express";
import ClientService from "../services/ClientService";
import EmploeeService from "../services/EmploeeService";
import ReserveVehicleService from "../services/ReserveVehicleService";
import VehicleService from "../services/VehicleService";
import { ErrorServer, ErrorValidation, SuccessResponse } from "../types/responses";
import { reserveVehicleStatus, vehicleStatus } from "../types/status";
import EmploeeValidator from "../validators/EmploeeValidator";
import ReserveVehicleValidator from "../validators/ReserveVehicleValidator";
import experationReserve from "../validators/validations/validationDateReserve";
import { validationPagination } from "../validators/validations/validationPagination";
import ReserveVehicleView from "../views/ReserveVehicleView";

class ReserveVehicleController{
  async createReserveVehicle(request: Request, response: Response): Promise<Response> {
    const { valueReserve, clientId, emploeeId, vehicleId, reserveDays } = request.body;
    const validation = await ReserveVehicleValidator.createValidation({
      valueReserve,
      clientId,
      emploeeId,
      vehicleId,
      reserveDays
    });

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

      if(vehicle.status !== vehicleStatus.AVAILABLE){
          const res: ErrorValidation = {message: "Veiculo não disponivel para reserva", type: "error validation", errors: []};
          return response.status(403).json(res);
      }

      const reserveCreated = await ReserveVehicleService.createReserveVehicle({
        valueReserve,
        clientId,
        emploeeId,
        vehicleId,
        reserveExpiration: experationReserve(reserveDays),
        status: reserveVehicleStatus.OPEN
      })
      const reserveReturned = ReserveVehicleView.reserveVehicleView(reserveCreated);
      const res: SuccessResponse = {message: "Reserva criada com sucesso", type: "success", body: reserveReturned};
      return response.status(201).json(res);

    } catch (error) {
      const res: ErrorServer = {message: "Erro no servidor", type: "error server", errors: []};
      return response.status(500).json(res);
    }
  }

  async listReservesVehiclesByEmploee(request: Request, response: Response): Promise<Response> {
    const { emploeeId } = request.params;
    const { page = 1, limit = 10} = request.query;
    const pagination = validationPagination(Number(page), Number(limit));
    const validation = await EmploeeValidator.idValidation(emploeeId);

    if(!validation.isValid){
      const res: ErrorValidation = {message: "Identificador de funcionario não valido", type: "error validation", errors: validation.errors};
      return response.status(403).json(res);
    }


    try {
      const emploee = await EmploeeService.findEmploeeById(emploeeId);
      if(!emploee){
        const res: ErrorValidation = {message: "Duncionario não encontrado", type: "error validation", errors: []};
      return response.status(403).json(res);
      }
      const reserves = await ReserveVehicleService.findReservesByEmploee(emploeeId, pagination.page, pagination.limit);
      const reservesReturned = ReserveVehicleView.reservesByJoinView(reserves);
      const res: SuccessResponse = {message: `Reservas realizadas pelo funcionario ${emploee.name}`, type: "success", body: reservesReturned};
      return response.status(200).json(res);

    } catch (error) {
      const res: ErrorServer = {message: "Erro no servidor", type: "error server", errors: []};
      return response.status(500).json(res);
    }
  }

  async listReserves(request: Request, response: Response): Promise<Response> {
    const { page = 1, limit = 10 } = request.query;
    const validation = validationPagination(Number(page), Number(limit));

    try {
      const reserves = await ReserveVehicleService.findAllReserves(validation.page, validation.limit);
      const reservesReturned = ReserveVehicleView.reservesByJoinView(reserves);
      const res: SuccessResponse = {message: "Listagem de reservas", type: "success", body: reservesReturned};
      return response.status(200).json(res);

    } catch (error) {
      const res: ErrorServer = {message: "Erro no servidor", type: "error server", errors: []};
      return response.status(500).json(res);
    }
  }

  async closeReserve(request: Request, response: Response): Promise<Response> {
    const { reserveId } = request.params;
    const validation = await ReserveVehicleValidator.idValidation(reserveId);
    if(!validation.isValid){
      const res: ErrorValidation = {message: "Identificador da reserva não valido", type: "error validation", errors: validation.errors};
      return response.status(403).json(res);
    }

    try {
      const reserve = await ReserveVehicleService.findReserveById(reserveId);
      if(!reserve){
        const res: ErrorValidation = {message: "Nenhuma reserva encontrada", type: "error validation", errors: []};
        return response.status(403).json(res);
      }
      if(reserve.status === reserveVehicleStatus.CLOSED){
        const res: ErrorValidation = {message: "Essa reserva já está fechada", type: "error validation", errors: []};
        return response.status(403).json(res);
      }

      await ReserveVehicleService.closeReserve(reserveId, reserve.vehicleId);
      const res: SuccessResponse = {message: "Reserva fechada com sucesso", type: "success"};
      return response.status(200).json(res);

    } catch (error) {

    }

  }
}

export default new ReserveVehicleController();
