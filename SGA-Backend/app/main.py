from fastapi import FastAPI
from app.core.database import engine, Base
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routers import produtos, edicao, estoque, chart, auth, recebimentos, saidas, saldos
from app.seed import seed_data
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers - prefixados com /api para evitar conflito com arquivos estáticos
app.include_router(auth.router, prefix="/api")
app.include_router(produtos.router, prefix="/api")
app.include_router(edicao.router, prefix="/api")
app.include_router(recebimentos.router, prefix="/api")
app.include_router(saidas.router, prefix="/api")
app.include_router(saldos.router, prefix="/api")
app.include_router(estoque.router, prefix="/api")
app.include_router(chart.router, prefix="/api")

@app.on_event("startup")
async def startup():
    # Cria as tabelas automaticamente se não existirem
    async with engine.begin() as conn:
        # Alterar colunas para BIGINT se necessário (correção de esquema legado)
        try:
            await conn.execute(text("ALTER TABLE dimproduto ALTER COLUMN codigo TYPE BIGINT"))
            await conn.execute(text("ALTER TABLE factrecebimento ALTER COLUMN codigo TYPE BIGINT"))
            await conn.execute(text("ALTER TABLE factsaidas ALTER COLUMN codigo TYPE BIGINT"))
            await conn.execute(text("ALTER TABLE factcategoria ALTER COLUMN codigo TYPE BIGINT"))
            await conn.execute(text("ALTER TABLE factcategoria ALTER COLUMN idcategoria TYPE BIGINT"))
            await conn.execute(text("ALTER TABLE dimcategoria ALTER COLUMN idcategoria TYPE BIGINT"))
            await conn.execute(text("ALTER TABLE factcategoria ALTER COLUMN idcategoriaproduto TYPE BIGINT"))
        except Exception as e:
            print(f"Nota: Fallback de alteração de coluna (provavelmente já alterado): {e}")
        
        await conn.run_sync(Base.metadata.create_all)
    
    # Popula dados iniciais (Admin e categorias)
    await seed_data()

# Servir Frontend (arquivos estáticos) na raiz
# Isso deve vir por último para que as rotas de API tenham prioridade
static_dir = os.path.join(os.getcwd(), "app/static")
if not os.path.exists(static_dir):
    # Fallback caso esteja rodando da raiz do monorepo
    static_dir = os.path.join(os.getcwd(), "SGA-Backend/app/static")

app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
