package com.seikyuuressha.lms.configuration;

import graphql.language.StringValue;
import graphql.schema.*;
import lombok.NonNull;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.graphql.execution.RuntimeWiringConfigurer;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Configuration
public class GraphQLConfig {

    @Bean
    public RuntimeWiringConfigurer runtimeWiringConfigurer() {
        return wiringBuilder -> wiringBuilder
                .scalar(uuidScalar())
                .scalar(dateTimeScalar())
                .scalar(bigDecimalScalar());
    }

    private GraphQLScalarType uuidScalar() {
        return GraphQLScalarType.newScalar()
                .name("UUID")
                .description("UUID scalar")
                .coercing(new Coercing<UUID, String>() {
                    @Override
                    public String serialize(Object dataFetcherResult) throws CoercingSerializeException {
                        if (dataFetcherResult instanceof UUID) {
                            return dataFetcherResult.toString();
                        }
                        throw new CoercingSerializeException("Expected a UUID object.");
                    }

                    @Override
                    public UUID parseValue(Object input) throws CoercingParseValueException {
                        try {
                            if (input instanceof String) {
                                return UUID.fromString((String) input);
                            }
                            throw new CoercingParseValueException("Expected a String");
                        } catch (Exception e) {
                            throw new CoercingParseValueException("Invalid UUID format", e);
                        }
                    }

                    @Override
                    public UUID parseLiteral(Object input) throws CoercingParseLiteralException {
                        if (input instanceof StringValue) {
                            try {
                                return UUID.fromString(((StringValue) input).getValue());
                            } catch (Exception e) {
                                throw new CoercingParseLiteralException("Invalid UUID format", e);
                            }
                        }
                        throw new CoercingParseLiteralException("Expected a StringValue.");
                    }
                })
                .build();
    }

    private GraphQLScalarType dateTimeScalar() {
        return GraphQLScalarType.newScalar()
                .name("DateTime")
                .description("DateTime scalar")
                .coercing(new Coercing<LocalDateTime, String>() {
                    private final DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

                    @Override
                    public String serialize(Object dataFetcherResult) throws CoercingSerializeException {
                        if (dataFetcherResult instanceof LocalDateTime) {
                            return ((LocalDateTime) dataFetcherResult).format(formatter);
                        }
                        throw new CoercingSerializeException("Expected a LocalDateTime object.");
                    }

                    @Override
                    public LocalDateTime parseValue(Object input) throws CoercingParseValueException {
                        try {
                            if (input instanceof String) {
                                return LocalDateTime.parse((String) input, formatter);
                            }
                            throw new CoercingParseValueException("Expected a String");
                        } catch (Exception e) {
                            throw new CoercingParseValueException("Invalid DateTime format", e);
                        }
                    }

                    @Override
                    public LocalDateTime parseLiteral(@NonNull Object input) throws CoercingParseLiteralException {
                        if (input instanceof StringValue) {
                            try {
                                return LocalDateTime.parse(((StringValue) input).getValue(), formatter);
                            } catch (Exception e) {
                                throw new CoercingParseLiteralException("Invalid DateTime format", e);
                            }
                        }
                        throw new CoercingParseLiteralException("Expected a StringValue.");
                    }
                })
                .build();
    }

    private GraphQLScalarType bigDecimalScalar() {
        return GraphQLScalarType.newScalar()
                .name("BigDecimal")
                .description("BigDecimal scalar")
                .coercing(new Coercing<BigDecimal, String>() {
                    @Override
                    public String serialize(Object dataFetcherResult) throws CoercingSerializeException {
                        if (dataFetcherResult instanceof BigDecimal) {
                            return dataFetcherResult.toString();
                        }
                        throw new CoercingSerializeException("Expected a BigDecimal object.");
                    }

                    @Override
                    public BigDecimal parseValue(Object input) throws CoercingParseValueException {
                        try {
                            if (input instanceof String) {
                                return new BigDecimal((String) input);
                            } else if (input instanceof Number) {
                                return BigDecimal.valueOf(((Number) input).doubleValue());
                            }
                            throw new CoercingParseValueException("Expected a String or Number");
                        } catch (Exception e) {
                            throw new CoercingParseValueException("Invalid BigDecimal format", e);
                        }
                    }

                    @Override
                    public BigDecimal parseLiteral(Object input) throws CoercingParseLiteralException {
                        if (input instanceof StringValue) {
                            try {
                                return new BigDecimal(((StringValue) input).getValue());
                            } catch (Exception e) {
                                throw new CoercingParseLiteralException("Invalid BigDecimal format", e);
                            }
                        }
                        throw new CoercingParseLiteralException("Expected a StringValue.");
                    }
                })
                .build();
    }
}
