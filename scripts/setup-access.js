#!/usr/bin/env node
// ============================================================
// setup-access.js — Set up Cloudflare Access with Google OAuth
//
// Usage: CF_API_TOKEN=<token> node scripts/setup-access.js
//
// Create an API token at:
//   https://dash.cloudflare.com/profile/api-tokens
//   Template: "Create Custom Token"
//   Permissions: Account > Access: Apps and Policies > Edit
// ============================================================

const ACCOUNT_ID = "867ebb8417e1abfd476f481c826c10f2";
const APP_DOMAIN = "through-the-ages.pages.dev";

const TOKEN = process.env.CF_API_TOKEN;
if (!TOKEN) {
    console.error("Error: Set CF_API_TOKEN environment variable");
    console.error("");
    console.error("Create one at: https://dash.cloudflare.com/profile/api-tokens");
    console.error("  - Click 'Create Token'");
    console.error("  - Use 'Custom Token' template");
    console.error("  - Permission: Account > Access: Apps and Policies > Edit");
    console.error("  - Account Resources: Include > Your account");
    console.error("");
    console.error("Then run: CF_API_TOKEN=<your-token> node scripts/setup-access.js");
    process.exit(1);
}

const https = require("https");

function cfApi(method, path, body) {
    return new Promise((resolve, reject) => {
        const opts = {
            hostname: "api.cloudflare.com",
            path: `/client/v4/accounts/${ACCOUNT_ID}${path}`,
            method,
            headers: {
                "Authorization": `Bearer ${TOKEN}`,
                "Content-Type": "application/json",
            },
        };
        const req = https.request(opts, (res) => {
            let data = "";
            res.on("data", (d) => (data += d));
            res.on("end", () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { resolve({ success: false, error: data }); }
            });
        });
        req.on("error", reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function main() {
    console.log("Setting up Cloudflare Access for Through the Ages...\n");

    // Step 1: Add Google as identity provider
    console.log("1. Creating Google identity provider...");
    const idpResult = await cfApi("POST", "/access/identity_providers", {
        name: "Google",
        type: "google",
        config: {
            // Note: client_id and client_secret need to be set
            // For "Login with Google" via Cloudflare, you can use
            // Cloudflare's built-in Google integration (no config needed)
        },
    });

    if (idpResult.success) {
        console.log("   ✓ Google identity provider created:", idpResult.result.id);
    } else if (idpResult.errors?.[0]?.message?.includes("already exists")) {
        console.log("   ✓ Google identity provider already exists");
    } else {
        console.log("   Note:", JSON.stringify(idpResult.errors || idpResult));
        console.log("   You may need to add Google as an IdP in the Zero Trust dashboard:");
        console.log("   https://one.dash.cloudflare.com/");
    }

    // Step 2: Create Access application
    console.log("\n2. Creating Access application...");
    const appResult = await cfApi("POST", "/access/apps", {
        name: "Through the Ages",
        domain: APP_DOMAIN,
        type: "self_hosted",
        session_duration: "720h", // 30 days
        auto_redirect_to_identity: true,
        allowed_idps: [], // empty = all configured IdPs
        app_launcher_visible: true,
    });

    if (appResult.success) {
        console.log("   ✓ Access app created:", appResult.result.id);
        console.log("   Domain:", appResult.result.domain);

        // Step 3: Create allow-all policy (anyone with Google can access)
        console.log("\n3. Creating access policy (allow all Google users)...");
        const policyResult = await cfApi(
            "POST",
            `/access/apps/${appResult.result.id}/policies`,
            {
                name: "Allow Google Users",
                decision: "allow",
                include: [{ everyone: {} }], // Allow everyone who authenticates
                precedence: 1,
            }
        );

        if (policyResult.success) {
            console.log("   ✓ Policy created: allow all authenticated users");
        } else {
            console.log("   Error:", JSON.stringify(policyResult.errors));
        }
    } else {
        console.log("   Error:", JSON.stringify(appResult.errors));
        if (appResult.errors?.[0]?.message?.includes("already exists")) {
            console.log("   Access app may already exist. Check the dashboard.");
        }
    }

    console.log("\n✅ Setup complete!");
    console.log(`\nVisit https://${APP_DOMAIN} — you should see a Google login prompt.`);
    console.log("\nThe authenticated user's identity will be available via:");
    console.log("  - Cookie: CF_Authorization (JWT)");
    console.log("  - Header: Cf-Access-Jwt-Assertion (on Workers/Functions)");
}

main().catch(console.error);
