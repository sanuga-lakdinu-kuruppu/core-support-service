import { createConnection } from "./config/databaseConnection.mjs";
import { fetchTripDetailsAndTrigger } from "./service/service.mjs";

createConnection();

export const handler = async (event) => {
  console.log(`core support service event triggered`);
  try {
    const {
      internalEventType,
      tripId,
      startLocation,
      endLocation,
      route,
      schedule,
      vehicle,
      driver,
      operator,
      conductor,
      cancellationPolicy,
    } = JSON.parse(event.detail);

    if (internalEventType === "EVN_TRIP_CREATED") {
      console.log(
        `core support service event triggered, ${internalEventType} `
      );
      await fetchTripDetailsAndTrigger(
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
      );
    }

    console.log("core support service event processed successfully.");
  } catch (error) {
    console.log(`core support service error occured: ${error}`);
  }
};
