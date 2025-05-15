import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { APIKEY_HEADER } from "./modules/auth/guard";

extendZodWithOpenApi(z);

export const openApiRegistry = new OpenAPIRegistry();

const apikeyAuth = openApiRegistry.registerComponent(
  "securitySchemes",
  "apikeyAuth",
  {
    type: "apiKey",
    in: "header",
    name: APIKEY_HEADER,
  },
);
export const apikeyAuthSecurity = { [apikeyAuth.name]: [] };

export const generateOpenApiDocs = () => {
  const generator = new OpenApiGeneratorV3(openApiRegistry.definitions);
  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "Placies API",
    },
  });
};
