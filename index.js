#!/usr/bin/env node

import { createInterface } from 'readline';

// Parse command line arguments
const args = process.argv.slice( 2 );

if ( args.length < 2 ) {
	console.error( 'Usage: mcp-wp-remote <url> <api-key>' );
	process.exit( 1 );
}

let url = args[ 0 ];
const apiKey = args[ 1 ];
if( args[ 2 ] ) {
	/// use the third argument as api key if provided to create a tunnel for remote access to dev/internal sites
	remoteapi = args[ 2 ];
}

// Add the endpoint path if not present
const endpoint = '/wp-json/websamurai/v1/mcp';
if ( ! url.endsWith( endpoint ) ) {
	url = url.replace( /\/$/, '' ) + endpoint;
}

// Validate URL
try {
	new URL( url );
} catch ( error ) {
	console.error( 'Invalid URL provided:', url );
	process.exit( 1 );
}

// Create readline interface for STDIO
const rl = createInterface( {
	input: process.stdin,
	output: process.stdout,
	terminal: false
} );

// Buffer for accumulating input lines
let inputBuffer = '';
console.log( JSON.stringify( {
	jsonrpc: "2.0",
	method: "notifications/message",
	params: {
		level: "info",
		logger: "stdio",
		data: {
			message: "Welcome to the WebSamurai MCP Remote Client!",
		}
	}
} ) );

// Process each line from STDIN
rl.on( 'line', async ( line ) => {
	inputBuffer += line;

	// Try to parse as JSON
	try {
		const jsonInput = JSON.parse( inputBuffer );
		inputBuffer = ''; // Reset buffer on successful parse

		// Send JSON-RPC request to endpoint
		try {
			let body = {
				jsonrpc: '2.0',
				method: jsonInput.method,
				params: jsonInput.params || {},
			};
			const response = await fetch( url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${ apiKey }`
				},
				body: JSON.stringify( body )
			} );

			if ( ! response.ok ) {
				const errorText = await response.text();
				console.error( JSON.stringify( {
					jsonrpc: '2.0',
					error: {
						code: response.status,
						message: `HTTP ${ response.status }: ${ errorText }`
					},
					id: jsonInput.id
				} ) );
				return;
			}

			const result = await response.json();
			if( result && result.jsonrpc && result.result ) {
				let out = {
					jsonrpc: '2.0',
					result: result.result,
					id: jsonInput.id
				}
				console.log( JSON.stringify( out ) );
			} else {
				const errorText = await response.text();
				console.error( JSON.stringify( {
					jsonrpc: '2.0',
					error: {
						code: response.status,
						message: `HTTP ${ response.status }: ${ errorText }`
					},
					id: jsonInput.id
				} ) );
				return;
			}

		} catch ( fetchError ) {
			console.error( JSON.stringify( {
				jsonrpc: '2.0',
				error: {
					code: -32000,
					message: `Network error: ${ fetchError.message }`,
				},
				id: jsonInput.id
			} ) );
		}

	} catch ( parseError ) {
		// Not valid JSON yet, continue accumulating
		// This allows for multi-line JSON input
	}
} );

rl.on( 'close', () => {
	process.exit( 0 );
} );

// Handle process termination
process.on( 'SIGINT', () => {
	process.exit( 0 );
} );

process.on( 'SIGTERM', () => {
	process.exit( 0 );
} );
