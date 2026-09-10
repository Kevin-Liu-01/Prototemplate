# Kafka

Use this skill when work touches Kafka-compatible logs: Apache Kafka, Redpanda, Confluent Cloud, AWS MSK, Kafka Connect, Schema Registry, producers, consumers, or stream processors.

## Core model

Kafka is a retained, partitioned commit log, not a delete-on-read queue. Design around topics, partitions, offsets, retention, consumer groups, replay, and in-partition ordering. Read `wiki/architecture/log-streaming-architecture.md` for Kevin's canonical model before making architecture decisions.

## Procedure

1. Identify the runtime: Apache Kafka, Confluent, Redpanda, MSK, local Docker, or testcontainer.
2. Confirm environment and cluster before mutation. For MSK, also use the AWS skills, especially `aws-messaging-and-streaming` and `aws-managing-amazon-msk`.
3. Name the event contract first: topic, key, value schema, compatibility mode, retention, partition count, consumer groups, and ownership.
4. Pick partition keys deliberately. The key defines the ordering boundary and can create hot partitions.
5. Prefer at-least-once delivery with idempotent consumers. Use transactions and exactly-once semantics only when the end-to-end sink can honor them.
6. Treat schemas as public contracts. Use Schema Registry or an equivalent compatibility gate when multiple producers or consumers exist.
7. Instrument lag, error topics, retries, dead letters, rebalance churn, producer errors, and consumer throughput before calling the system healthy.
8. Verify with a replay or deterministic local test: produce known records, consume them through the real code path, and prove offsets/side effects behave under duplicate delivery.

## Guardrails

- Do not increase partition counts casually; it changes key distribution and may break ordering assumptions.
- Do not use Kafka as a request/response RPC bus without an explicit timeout, correlation id, and failure model.
- Do not commit offsets before durable side effects unless at-most-once loss is acceptable.
- Do not hide poison messages in infinite retry loops. Use bounded retries plus a dead-letter or quarantine path.
- Do not claim "exactly once" unless the producer, transaction boundary, consumer, and sink are all part of the proof.
