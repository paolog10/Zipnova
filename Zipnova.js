import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
    autorizarZipnova,
    estadoZipnova,
    desconectarZipnova
} from '../../api/axios';
import PropTypes from 'prop-types';

const Zipnova = ({ idSeller, id }) => {
    const [estado, setEstado] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        consultarEstado();
    }, []);

    const consultarEstado = async () => {
        try {
            const data = await estadoZipnova(idSeller);
            setEstado(data);
        } catch (error) {
            console.error(error);
            toast.error('Error al consultar el estado de ZIP Nova');
        }
    };

    const consultarEstadoConRetry = async (reintentos = 5) => {
        try {

            const data = await estadoZipnova(idSeller);
            console.log('Estado:', data);

            if (data.conectado) {
                setEstado(data);
                return;
            }

            if (reintentos > 0) {
                setTimeout(() => {
                    consultarEstadoConRetry(reintentos - 1);
                }, 1000); // reintenta cada 1s
            } else {
                setEstado(data);
            }

        } catch (error) {
            console.error(error);
            toast.error('Error al consultar el estado de ZIP Nova');
        }
    };

    const abrirPopupCentrado = (url) => {
        const width = 600;
        const height = 700;

        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        return window.open(
            url,
            'ZIP Nova',
            `width=${width},height=${height},left=${left},top=${top}`
        );
    };

    const handleAutorizar = async () => {
        try {
            setLoading(true);

            const { urlAutorizacion } = await autorizarZipnova(idSeller);

            if (!urlAutorizacion) {
                toast.error('No se pudo obtener la URL de autorización');
                setLoading(false);
                return;
            }

            const separator = urlAutorizacion.includes('?') ? '&' : '?';
            const urlFinal = `${urlAutorizacion}${separator}prompt=login&max_age=0&nonce=${Date.now()}`;

            const popup = abrirPopupCentrado(urlFinal);

            if (!popup) {
                toast.error('El navegador bloqueó el popup.');
                setLoading(false);
                return;
            }

            const interval = setInterval(() => {
                try {
                    const currentUrl = popup.location.href;

                    if (currentUrl.includes('/oauth/zipnova/callback')) {
                        clearInterval(interval);
                        popup.close();
                        setLoading(false);
                        toast.info('Verificando conexión con ZIP Nova...');
                        consultarEstadoConRetry();
                    }
                } catch (e) {
                    // cross-origin, ignorar
                }

                if (!popup || popup.closed) {
                    clearInterval(interval);
                    setLoading(false);
                    toast.info('Verificando conexión con ZIP Nova...');
                    consultarEstadoConRetry();
                }
            }, 500);

            // fallback por si todo falla
            setTimeout(() => {
                if (loading) {
                    setLoading(false);
                    toast.info('Verificando conexión con ZIP Nova...');

                    consultarEstadoConRetry();
                }
            }, 8000);

        } catch (error) {
            console.error('ERROR AUTORIZAR ZIPNOVA:', error);
            toast.error('Error al iniciar la autorización con ZIP Nova');
            setLoading(false);
        }
    };

    const handleDesconectar = async () => {
        try {
            setLoading(true);

            await desconectarZipnova(idSeller);
            await consultarEstado();

            toast.success('Cuenta ZIP Nova desconectada correctamente');
        } catch (error) {
            console.error('ERROR DESCONEXION ZIPNOVA:', error);
            toast.error('Error al desconectar la cuenta ZIP Nova');
        } finally {
            setLoading(false);
        }
    };

    const renderEstado = () => {
        if (!estado) return null;

        if (estado.conectado) {
            return (
                <div className="alert alert-success mt-3">
                    <strong>Conectado</strong>
                    <br />
                    {estado.cuentaExterna?.nombre && (
                        <>Cuenta: {estado.cuentaExterna.nombre}</>
                    )}
                </div>
            );
        }

        return (
            <div className="alert alert-secondary mt-3">
                Cuenta no conectada.
            </div>
        );
    };

    const renderBoton = () => {
        const conectado = estado?.conectado;

        let texto = '';
        let claseBoton = '';
        let icono = '';
        let accion = null;

        if (conectado) {
            claseBoton = 'btn-danger';
            icono = 'mdi-link-off';
            accion = handleDesconectar;
            texto = loading ? 'Desconectando...' : 'Desconectar cuenta ZIP Nova';
        } else {
            claseBoton = 'btn-primary';
            icono = 'mdi-link-variant';
            accion = handleAutorizar;
            texto = loading ? 'Conectando...' : 'Conectar cuenta ZIP Nova';
        }

        return (
            <button
                type="button"
                className={`btn ${claseBoton}`}
                onClick={accion}
                disabled={loading}
            >
                <i className={`mdi ${icono} mr-2`}></i>
                {texto}
            </button>
        );
    };

    Zipnova.propTypes = {
        idSeller: PropTypes.number,
        id: PropTypes.number,
    }

    return (
        <div className="card">
            <div className="card-body">
                <h5 className="card-title">Integración ZIP Nova</h5>

                <p className="text-muted">
                    Conecte su cuenta ZIP Nova para habilitar la integración.
                </p>

                {renderBoton()}
                {renderEstado()}
            </div>
        </div>
    );
};

export default Zipnova;