import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";


export let authClient = createAuthClient({
  baseURL: SecureStore.getItem("API_URL")!,
  plugins: [
    expoClient({
      scheme: "musubi",
      storagePrefix: "musubi",
      storage: SecureStore,
    })
  ]
});

export function updateAuthClient() {
  authClient = createAuthClient({
    baseURL: SecureStore.getItem("API_URL")!,
    plugins: [
      expoClient({
        scheme: "musubi",
        storagePrefix: "musubi",
        storage: SecureStore,
      })
    ]
  });
}
