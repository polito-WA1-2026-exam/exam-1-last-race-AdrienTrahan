import { InvalidRequest } from '../error.js';
import express from 'express';
import z from 'zod';

export const validateBody = (schema) => async (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) throw new InvalidRequest();
    req.body = result.data;
    next();
};

export const validateQuery = (schema) => async (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) throw new InvalidRequest();
    req.query = result.data;
    next();
};

export const validateParams = (schema) => async (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) throw new InvalidRequest();
    req.params = result.data;
    next();
};

export const validateHeader = (schema) => async (req, res, next) => {
    const result = schema.safeParse(req.headers);
    if (!result.success) throw new InvalidRequest();
    req.headers = result.data;
    next();
};
