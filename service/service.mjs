import { Station } from "../model/stationModel.mjs";
import { Route } from "../model/routeModel.mjs";
import { Schedule } from "../model/scheduleModel.mjs";
import { Vehicle } from "../model/vehicleModel.mjs";
import { BusWorker } from "../model/busWorkerModel.mjs";
import { BusOperator } from "../model/busOperatorModel.mjs";
import { Policy } from "../model/policyModel.mjs";
import AWS from "aws-sdk";

const eventBridge = new AWS.EventBridge({
  region: process.env.FINAL_AWS_REGION,
});

export const fetchTripDetailsAndTrigger = async (
  tripId,
  startLocation,
  endLocation,
  route,
  schedule,
  vehicle,
  driver,
  conductor,
  operator,
  cancellationPolicy
) => {
  try {
    const [
      startLocationData,
      endLocationData,
      routeData,
      vehicleData,
      driverData,
      conductorData,
      operatorData,
      cancellationPolicyData,
      scheduleData,
    ] = await Promise.all([
      Station.findOne({ stationId: startLocation }),
      Station.findOne({ stationId: endLocation }),
      Route.findOne({ routeId: route }),
      Vehicle.findOne({ vehicleId: vehicle }),
      BusWorker.findOne({ workerId: driver }),
      BusWorker.findOne({ workerId: conductor }),
      BusOperator.findOne({ operatorId: operator }),
      Policy.findOne({ policyId: cancellationPolicy }),
      Schedule.findOne({ scheduleId: schedule }),
    ]);
    const eventParams = {
      Entries: [
        {
          Source: "aws.lambda",
          DetailType: "TRIP_SUPPORT_SERVICE",
          Detail: JSON.stringify({
            internalEventType: "EVN_TRIP_DETAIL_FETCHED",
            tripId: tripId,
            startLocation: startLocationData,
            endLocation: endLocationData,
            route: routeData,
            vehicle: vehicleData,
            driver: driverData,
            conductor: conductorData,
            operator: operatorData,
            cancellationPolicy: cancellationPolicyData,
            schedule: scheduleData,
          }),
        },
      ],
    };

    await eventBridge.putEvents(eventParams).promise();
  } catch (error) {
    console.log(`core support service error occured: ${error}`);
  }
};
