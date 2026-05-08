using megamarketplacenetcore.Models.Integraciones;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading;
using System.Threading.Tasks;
using megamarketplacenetcore.Helpers.Interface;

namespace megamarketplacenetcore.Controllers
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [Route("api/[controller]")]
    [ApiController]
    public class IntegracionesController : ControllerBase
    {
        private readonly IBffTransparentProxyHelper _bffTransparentProxyHelper;

        public IntegracionesController(IBffTransparentProxyHelper bffTransparentProxyHelper)
        {
            _bffTransparentProxyHelper = bffTransparentProxyHelper;
        }

        private async Task<IActionResult> ProxyAsync(string externalPath, CancellationToken cancellationToken)
        {
            await _bffTransparentProxyHelper.ProxyAsync(HttpContext, externalPath, cancellationToken);
            return new EmptyResult();
        }

        [HttpPost("Proveedor/Autorizar")]
        public async Task<IActionResult> Autorizar([FromQuery]AutorizarProveedorRequest request, CancellationToken cancellationToken)
        {
            try
            {
                return await ProxyAsync(request?.URL ?? "api/Integraciones/Proveedor/Autorizar", cancellationToken);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error en proxy integraciones autorizar proveedor.", detalle = ex.Message, inner = ex.InnerException?.Message });
            }
        }

        [HttpGet("Proveedor/Estado")]
        public async Task<IActionResult> Get([FromQuery] EstadoProveedorRequest request, CancellationToken cancellationToken)
        {
            try
            {
                return await ProxyAsync(request?.URL ?? "api/Integraciones/Proveedor/Estado", cancellationToken);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error en proxy integraciones estado proveedor.", detalle = ex.Message, inner = ex.InnerException?.Message });
            }
        }

        [HttpDelete("Proveedor/Desconectar")]
        public async Task<IActionResult> Desconectar([FromQuery] DesconectarProveedorRequest request, CancellationToken cancellationToken)
        {
            try
            {
                return await ProxyAsync(request?.URL ?? "api/Integraciones/Proveedor/Desconectar", cancellationToken);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error en proxy integraciones desconectar proveedor.", detalle = ex.Message, inner = ex.InnerException?.Message });
            }
        }
    }
}
