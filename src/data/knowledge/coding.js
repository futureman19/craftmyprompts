export const CODING_KNOWLEDGE = {
    react_server_components: `
        // TOPIC: React Server Components (Next.js 14+)
        // 1. Critical Rules
        // - Default to Server Components. Only add 'use client' when specific interactivity (useState, useEffect, onClick) is required.
        // - NEVER use useEffect for data fetching in a Server Component. Use async/await directly in the component body.
        // - Do not pass non-serializable data (like functions) from Server to Client components.
        
        // 2. Syntax Pattern
        // - Server Component (Data Fetching):
        import { db } from "@/lib/db";
        export default async function UserProfile({ params }) {
          const user = await db.user.findUnique({ where: { id: params.id } }); // Direct DB query
          return <main>{user.name}</main>;
        }
        
        // - Client Component (Interactivity):
        "use client"; // Directive must be at the top
        import { useState } from "react";
        export default function LikeButton() { ... }

        // 3. Common Mistakes
        // - The AI adds "use client" to the page root, disabling server rendering for the entire route.
        // - The AI tries to use \`useState\` in an \`async\` component.
    `,

    tailwind_modern: `
        // TOPIC: Tailwind CSS (Modern JIT)
        // 1. Critical Rules
        // - Use Arbitrary Values \`[val]\` for specific requirements; do not edit config for one-offs.
        // - Prefer Container Queries (\`@container\`) over Media Queries (\`@md\`, \`@lg\`) for reusable components (Cards, Widgets).
        // - Use \`grid\` for layouts; use \`flex\` for alignment.

        // 2. Syntax Pattern
        // - Arbitrary Values: <div class="grid grid-cols-[250px_1fr] gap-4">
        // - Container Queries: <div class="@container/card"><div class="flex flex-col @md/card:flex-row">...</div></div>
        
        // 3. Common Mistakes
        // - AI invents classes like \`w-350px\` (invalid) instead of \`w-[350px]\` (valid).
        // - AI uses viewport breakpoints (\`md:\`) for sidebar widgets, causing them to break layout.
    `,

    supabase_v2: `
        // TOPIC: Supabase (Postgres & Auth)
        // 1. Critical Rules
        // - Use \`signInWithPassword\` (v2), NOT \`signIn\` (v1).
        // - Always enable RLS on tables. Security logic belongs in SQL policies, not JS conditionals.
        // - In Edge Functions, you MUST extract the 'Authorization' header and pass it to the Supabase client to preserve user context.

        // 2. Syntax Pattern
        // - v2 Auth: await supabase.auth.signInWithPassword({ email, password });
        // - RLS Policy: create policy "Owner view" on table for select using (auth.uid() = user_id);
        // - Edge Function: createClient(url, key, { global: { headers: { Authorization: req.headers.get('Authorization') } } })

        // 3. Common Mistakes
        // - AI uses deprecated \`supabase.auth.signIn({ email })\`.
        // - AI writes security logic in the client (e.g., \`if (user.id === post.user_id)\`), ignoring RLS.
    `,

    scrypt_bitcoin: `
        // TOPIC: sCrypt (Bitcoin SV)
        // 1. Critical Rules
        // - Bitcoin is UTXO-based. There is no global state. State is passed from one UTXO to the next.
        // - Use \`@prop(true)\` to mark stateful properties.
        // - You must explicitly construct the next output using \`this.buildStateOutput()\` and verify it using \`this.ctx.hashOutputs\`.

        // 2. Syntax Pattern
        import { SmartContract, method, prop, assert, ByteString, hash256, SigHash } from 'scrypt-ts';
        export class Counter extends SmartContract {
            @prop(true) count: bigint;
            @method(SigHash.ANYONECANPAY_SINGLE)
            public increment() {
                this.count++;
                const output: ByteString = this.buildStateOutput(this.count);
                assert(this.ctx.hashOutputs === hash256(output), 'hashOutputs mismatch');
            }
        }

        // 3. Common Mistakes
        // - AI attempts to use \`this.balance\` or \`transfer()\` like Solidity (Account model).
        // - AI forgets to update state and verify \`hashOutputs\`.
    `,

    solidity_security: `
        // TOPIC: Solidity (Ethereum Security)
        // 1. Critical Rules
        // - Use "Checks-Effects-Interactions": Update state variables BEFORE sending funds.
        // - Always use \`nonReentrant\` modifier from OpenZeppelin for functions that transfer Ether.
        // - Pack storage variables: Group small types (uint64, address, bool) to fit within 32 bytes.

        // 2. Syntax Pattern
        // - Storage Packing: address a; uint64 b; bool c; (Fits in 1 slot)
        // - Pattern:
        //   require(valid);
        //   balance[msg.sender] = 0; (Effect)
        //   (bool success,) = msg.sender.call{value: amount}(""); (Interaction)
        //   require(success);

        // 3. Common Mistakes
        // - AI places the external call before the balance update (Reentrancy vulnerability).
        // - AI uses \`transfer()\` instead of \`call\`.
    `,

    fastapi_pydantic_v2: `
        // TOPIC: Python FastAPI
        // 1. Critical Rules
        // - Use Pydantic v2 methods: \`model_dump()\` NOT \`.dict()\`.
        // - Use \`Annotated\` for dependency injection to keep type hints clean.
        // - Use \`async def\` for I/O bound routes (DB, external APIs).

        // 2. Syntax Pattern
        from typing import Annotated
        from fastapi import FastAPI, Depends
        from pydantic import BaseModel, Field, field_validator
        
        class User(BaseModel):
             name: str
             @field_validator('name') ...
        
        @app.post("/users/")
        async def create(user: User, db: Annotated[Session, Depends(get_db)]):
             return user.model_dump()

        // 3. Common Mistakes
        // - AI uses deprecated \`user.dict()\`.
        // - AI uses \`@validator\` instead of \`@field_validator\`.
    `
};