export const KNOWLEDGE_BASE = {
    // --- CODING KNOWLEDGE ---
    
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
    `,

    // --- WRITING KNOWLEDGE ---

    linkedin_viral: `
        // TOPIC: LinkedIn "Bro-etry" Style
        // 1. Critical Rules
        // - One sentence per line (max 2). No block paragraphs.
        // - The first 2 lines must force a "See more" click (The Hook).
        // - Use "White Space" to control reading pacing.
        
        // 2. Structure
        // [Hook: Information Gap or Strong Opinion]
        // [Space]
        // [The "Turn": Reversal of expectation]
        // [List of Value:]
        // - Insight 1
        // - Insight 2
        // [CTA: Question or "Follow me"]

        // 3. Common Mistakes
        // - AI writes formal intros like "Dear Network".
        // - AI groups text into dense paragraphs.
    `,

    twitter_threads: `
        // TOPIC: Twitter/X Threads
        // 1. Critical Rules
        // - Tweet 1 is the Hook: Must include "Social Proof" + "The Promise".
        // - Use "1/x" or 🧵 to signal a thread.
        // - Final Tweet is the CTA: "Follow me" + "RT the first tweet".

        // 2. Syntax Pattern
        // Hook: "I analyzed 500 sales calls. Here is the script that doubles conversions: 🧵"
        // Body: "1. The Permission Ask..."
        // CTA: "If you found this useful, RT the first tweet."

        // 3. Common Mistakes
        // - AI uses hashtags in the middle of sentences.
        // - AI fails to number the tweets.
    `,

    seo_blog: `
        // TOPIC: SEO Blog Structure
        // 1. Critical Rules
        // - Primary Keyword in H1.
        // - Target "People Also Ask" questions as H2 headers.
        // - Answer the H2 immediately in the next paragraph (Definition format for Snippets).

        // 2. Structure
        // <article>
        //   <h1>Guide to [Keyword]</h1>
        //   <h2>What is [Keyword]?</h2>
        //   <p>[Keyword] is... (40-60 words)</p>
        //   <h2>Benefits</h2>
        //   <ul>...</ul>
        // </article>

        // 3. Common Mistakes
        // - AI writes long fluff intros before answering the user query.
        // - AI uses H4s instead of H2s for main sections.
    `,

    cold_email_b2b: `
        // TOPIC: Cold Email (B2B)
        // 1. Critical Rules
        // - Max 75 words. Ideally 3-4 sentences.
        // - No "I hope you are well." Start with the specific Trigger.
        // - CTA: Ask for *interest*, not *time* ("Worth a chat?" vs "Tuesday at 2?").

        // 2. Framework (The 3-Sentence Rule)
        // Hi [Name],
        // Saw you are hiring for [Role] — typically means [Pain Point].
        // We help [Competitor] solve this by [Mechanism].
        // Worth a quick conversation?

        // 3. Common Mistakes
        // - AI writes passive openings ("I wanted to reach out...").
        // - AI asks for a 30-minute meeting immediately.
    `,

    // --- ART & VIDEO KNOWLEDGE ---

    midjourney_v6: `
        // TOPIC: Midjourney v6 Parameters
        // 1. Critical Rules
        // - Use \`--sref\` for style consistency.
        // - Use \`--cref\` for character consistency.
        // - \`--stylize\` (0-1000) = adherence to MJ style; \`--raw\` = adherence to prompt.

        // 2. Syntax Pattern
        // /imagine prompt: Cyberpunk street detective --ar 16:9 --v 6.0 --sref [url] --cref [url] --cw 100 --stylize 250 --weird 100

        // 3. Common Mistakes
        // - AI places parameters at the beginning (must be at the end).
        // - AI uses \`--cw 0\` (face only) when it should use \`--cw 100\` (full outfit).
    `,

    runway_camera: `
        // TOPIC: Runway Gen-2 Camera Control
        // 1. Critical Rules
        // - Separate "Camera Motion" (Global) from "Motion Brush" (Local).
        // - Use values 1-10. Keep values low (3-5) for realism; high values cause warping.
        // - Specific Keywords: "Pan", "Tilt", "Zoom", "Roll".

        // 2. Settings Format
        // Camera Motion: Pan Right (+2), Zoom In (+3)
        // Motion Brush (Car): Horizontal Speed (+8)

        // 3. Common Mistakes
        // - AI prompts "Drone shot" without specific camera motion sliders.
        // - AI sets values to max (10), resulting in distortion.
    `,

    flux_prompts: `
        // TOPIC: Flux (Open Source Art)
        // 1. Critical Rules
        // - Use natural language sentences, not comma-separated tags.
        // - Enclose text to be rendered in quotes: "a sign saying 'HELLO'".
        // - Flux does NOT support negative prompts; omit unwanted elements or use positive description.

        // 2. Syntax Pattern
        // A photo of a woman in a cafe holding a cup that says "FLUX". Cinematic lighting, 35mm film grain.

        // 3. Common Mistakes
        // - AI uses negative prompts (Flux ignores them).
        // - AI uses "tag soup" which confuses the flow matching.
    `,

    // --- META KNOWLEDGE ---

    chain_of_thought: `
        // TOPIC: Chain of Thought (CoT)
        // 1. Critical Rules
        // - Force output of "## Reasoning" before "## Answer".
        // - Use trigger phrase: "Let's think step by step."
        
        // 2. System Instruction
        // "You are a logic engine. 
        // 1. Break the problem down. 
        // 2. Output your reasoning in steps. 
        // 3. Final Answer."
    `,

    tree_of_thoughts: `
        // TOPIC: Tree of Thoughts (ToT)
        // 1. Critical Rules
        // - Request 3 distinct solutions (Experts).
        // - Force a "Critique" phase.
        // - Force a "Synthesis" phase.

        // 2. Prompt Structure
        // "Expert 1: Propose solution A.
        // Expert 2: Propose solution B.
        // Expert 3: Critique A and B.
        // Synthesis: Combine best of both."
    `
};