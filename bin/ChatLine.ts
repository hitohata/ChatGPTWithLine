#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ChatLineStack } from '../lib/ChatLine-stack';

if (!(process.env.API_KEY && process.env.CHANNEL_SECRET && process.env.CHANNEL_ACCESS_TOKEN)) {
  console.error('Missing environment variables')
  process.exit(1)
}

const app = new cdk.App();
new ChatLineStack(app, 'ChatLineStack', {
  API_KEY: process.env.API_KEY,
  CHANNEL_SECRET: process.env.CHANNEL_SECRET,
  CHANNEL_ACCESS_TOKEN: process.env.CHANNEL_ACCESS_TOKEN,
});
