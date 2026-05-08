import axios from 'axios';
import Auth from '../auth';
import { encryptPassword } from '../utilities/encryptPassword';
import { getIdEstadoFromNombre } from '../utilities/Seller/EstadoSeller';
export const url = "";

axios.interceptors.response.use(
    response => response,
    error => {
        const status = error?.response?.status;
        const url = error?.config?.url || '';

        const esIntegracionOAuth =
            url.includes('/oauth/zipnova') ||
            url.includes('/api/oauth/');

        const esProxyBff =
            url.includes('/Proxy') ||
            url.includes('/EncabezadoProxy') ||
            url.includes('/EncabezadosProxy');

        const isLocalhostRuntime =
            typeof window !== 'undefined' &&
            window.location &&
            window.location.hostname === 'localhost';

        if (status === 401 && !esIntegracionOAuth && !esProxyBff && !isLocalhostRuntime) {
            Auth.logout();
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export const autorizarZipnova = (idSeller) => {
    return new Promise((resolve, reject) => {
        axios({
            method: 'post',
            url: `${url}/api/Integraciones/Proveedor/Autorizar`,
            params: {
                IdUsuario: idSeller,
                Proveedor: 1
            }
        }).then(response => {
            resolve(response.data);
        }).catch(err => {
            reject(err);
        })
    })
}

export const estadoZipnova = (idSeller) => {
    return new Promise((resolve, reject) => {
        axios({
            method: 'get',
            url: `${url}/api/Integraciones/Proveedor/Estado`,
            params: {
                IdUsuario: idSeller,
                Proveedor: 1
            }
        }).then(response => {
            resolve(response.data);
        }).catch(err => {
            reject(err);
        })
    })
}

export const desconectarZipnova = (idSeller) => {
    return new Promise((resolve, reject) => {
        axios({
            method: 'delete',
            url: `${url}/api/Integraciones/Proveedor/Desconectar`,
            params: {
                IdUsuario: idSeller,
                Proveedor: 1
            }
        }).then(response => {
            resolve(response.data);
        }).catch(err => {
            reject(err);
        })
    })
};