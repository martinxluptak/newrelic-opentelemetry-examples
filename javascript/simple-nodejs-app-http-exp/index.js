const express = require("express");
const app = express();
const api = require("@opentelemetry/api");
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-proto');
const { Meter, MeterProvider, PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics-base');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');


const PORT = process.env.PORT || "8080";

function getLargeValue() {
  result = ""
  for (i = 0; i < 4095; i++) {
    result += "A"
  }
  result += "BBBBBBBBBBBBB"
  return result
}

largeValue = getLargeValue()



const exporter = new OTLPMetricExporter({
	// compression: CompressionAlgorithm.GZIP,
	// credentials: credentials.createSsl(),
});

const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: "OpenTelemetry-Node.JS-Example",
});

const meterProvider = new MeterProvider(resource);
            meterProvider.addMetricReader(new PeriodicExportingMetricReader({
                exporter,
                exportIntervalMillis: 2000,
            }));

const meter = meterProvider.getMeter('myMeter');
const counter = meter.createCounter('test.request.counter');


app.get("/ping", (_, res) => {
  const currentSpan = api.trace.getSpan(api.context.active());
  counter.add(1, {
	env: 'dev'
  });
  // New Relic only accepts attributes values that are less than 4096 characters.
  // When viewing this span in New Relic, the value of the "truncate" attribute will contain no Bs
  currentSpan.setAttribute("truncate", largeValue)

  res.status(200).send("Pong");
});

app.listen(parseInt(PORT, 10), () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
